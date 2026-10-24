import type {
  ChatApprovalDecision,
  ChatApprovalPart,
  ChatApprovalResult,
  ChatInteractionHandle,
  ChatQuestion,
  ChatQuestionAnswer,
  ChatQuestionPart,
  ChatQuestionsResult,
} from "./chatTypes";

export function validateQuestions(questions: ChatQuestion[]) {
  if (!Array.isArray(questions) || !questions.length)
    throw new Error("Add at least one question.");
  const ids = new Set<string>();
  for (const question of questions) {
    if (
      !question.id?.trim() ||
      ids.has(question.id) ||
      !question.text?.trim() ||
      !Array.isArray(question.choices)
    )
      throw new Error("Questions need unique IDs and prompt text.");
    ids.add(question.id);
    const choices = new Set<string>();
    for (const choice of question.choices) {
      if (!choice.id?.trim() || choices.has(choice.id) || !choice.label?.trim())
        throw new Error("Choices need unique IDs and labels.");
      choices.add(choice.id);
    }
    if (
      !question.choices.length &&
      !question.allowCustom &&
      question.required !== false
    )
      throw new Error("A required question needs choices or a custom answer.");
  }
}

function validateAnswers(
  questions: ChatQuestion[],
  answers: ChatQuestionAnswer[],
): ChatQuestionAnswer[] | undefined {
  if (!Array.isArray(answers)) return;
  const supplied = new Map<string, ChatQuestionAnswer>();
  for (const answer of answers) {
    if (
      !answer ||
      supplied.has(answer.questionId) ||
      !questions.some((question) => question.id === answer.questionId)
    )
      return;
    supplied.set(answer.questionId, answer);
  }
  const normalized: ChatQuestionAnswer[] = [];
  for (const question of questions) {
    const answer = supplied.get(question.id) ?? {
      questionId: question.id,
      choiceIds: [],
    };
    if (
      !Array.isArray(answer.choiceIds) ||
      (answer.customText !== undefined && typeof answer.customText !== "string")
    )
      return;
    const choices = answer.choiceIds;
    const customText = answer.customText?.trim();
    if (
      new Set(choices).size !== choices.length ||
      choices.some((id) => !question.choices.some((choice) => choice.id === id))
    )
      return;
    if (customText && !question.allowCustom) return;
    if (!question.multiple && choices.length + (customText ? 1 : 0) > 1) return;
    if (question.required !== false && !choices.length && !customText) return;
    normalized.push({
      questionId: question.id,
      choiceIds: [...choices],
      ...(customText ? { customText } : {}),
    });
  }
  return normalized;
}

/** One instance belongs to one response turn. No resolver survives settlement. */
export function createChatInteractions(onSettled: () => void) {
  type Pending =
    | { part: ChatApprovalPart; resolve: (result: ChatApprovalResult) => void }
    | {
        part: ChatQuestionPart;
        resolve: (result: ChatQuestionsResult) => void;
      };
  const pending = new Map<string, Pending>();
  function approval(
    part: ChatApprovalPart,
  ): ChatInteractionHandle<ChatApprovalResult> {
    const result = new Promise<ChatApprovalResult>((resolve) => {
      pending.set(part.id, { part, resolve });
    });
    return { id: part.id, result };
  }
  function questions(
    part: ChatQuestionPart,
  ): ChatInteractionHandle<ChatQuestionsResult> {
    const result = new Promise<ChatQuestionsResult>((resolve) => {
      pending.set(part.id, { part, resolve });
    });
    return { id: part.id, result };
  }
  function resolveApproval(id: string, decision: ChatApprovalDecision) {
    const item = pending.get(id);
    if (
      !item ||
      item.part.type !== "approval" ||
      (decision !== "allow" && decision !== "deny")
    )
      return false;
    item.part.status = "answered";
    item.part.decision = decision;
    pending.delete(id);
    (item.resolve as (result: ChatApprovalResult) => void)({
      status: "answered",
      decision,
    });
    onSettled();
    return true;
  }
  function answerQuestions(id: string, answers: ChatQuestionAnswer[]) {
    const item = pending.get(id);
    if (!item || item.part.type !== "question") return false;
    const normalized = validateAnswers(item.part.questions, answers);
    if (!normalized) return false;
    item.part.status = "answered";
    item.part.answers = normalized;
    pending.delete(id);
    (item.resolve as (result: ChatQuestionsResult) => void)({
      status: "answered",
      answers: normalized.map((answer) => ({
        ...answer,
        choiceIds: [...answer.choiceIds],
      })),
    });
    onSettled();
    return true;
  }
  function cancel(id: string, notify = true) {
    const item = pending.get(id);
    if (!item) return false;
    item.part.status = "cancelled";
    pending.delete(id);
    item.resolve({ status: "cancelled" });
    if (notify) onSettled();
    return true;
  }
  return {
    approval,
    questions,
    resolveApproval,
    answerQuestions,
    cancel,
    cancelAll() {
      for (const id of pending.keys()) cancel(id, false);
    },
    get size() {
      return pending.size;
    },
  };
}
