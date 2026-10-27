import type {
  ChatApprovalDecision,
  ChatApprovalPart,
  ChatApprovalResult,
  ChatInteractionHandle,
  ChatQuestion,
  ChatQuestionAnswer,
  ChatQuestionPart,
  ChatQuestionsResult,
} from '../types/chatTypes';

/** Validates unique prompts and choices before any question part is published. */
export function validateQuestions(questions: ChatQuestion[]) {
  if (!Array.isArray(questions) || !questions.length)
    throw new Error('Add at least one question.');
  const ids = new Set<string>();
  for (const question of questions) {
    if (
      !question.id?.trim() ||
      ids.has(question.id) ||
      !question.text?.trim() ||
      !Array.isArray(question.choices)
    )
      throw new Error('Questions need unique IDs and prompt text.');
    ids.add(question.id);
    const choices = new Set<string>();
    for (const choice of question.choices) {
      if (!choice.id?.trim() || choices.has(choice.id) || !choice.label?.trim())
        throw new Error('Choices need unique IDs and labels.');
      choices.add(choice.id);
    }
    if (
      !question.choices.length &&
      !question.allowCustom &&
      question.required !== false
    )
      throw new Error('A required question needs choices or a custom answer.');
  }
}

/** Normalizes an answer snapshot only when every supplied answer matches its schema. */
function validateAnswers(
  questions: ChatQuestion[],
  answers: ChatQuestionAnswer[]
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
      (answer.customText !== undefined && typeof answer.customText !== 'string')
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
      ...(customText ? {customText} : {}),
    });
  }
  return normalized;
}

/** Resolver state retained only until the owning turn settles. */
type Pending =
  | {part: ChatApprovalPart; resolve: (result: ChatApprovalResult) => void}
  | {
      part: ChatQuestionPart;
      resolve: (result: ChatQuestionsResult) => void;
    };

/**
 * Owns pending approvals and questions for exactly one response turn.
 * Cancellation settles every promise and removes its resolver; interactions
 * cannot leak into the next generation.
 */
export class ChatInteractions {

  /** Unsettled parts indexed by their stable IDs. */
  private readonly pending = new Map<string, Pending>();

  /** Notifies the owning response after explicit settlement. */
  private readonly onSettled: () => void;

  /** Creates an empty interaction collection without publishing parts. */
  constructor(onSettled: () => void) {
    this.onSettled = onSettled;
    this.approval = this.approval.bind(this);
    this.questions = this.questions.bind(this);
    this.resolveApproval = this.resolveApproval.bind(this);
    this.answerQuestions = this.answerQuestions.bind(this);
    this.cancel = this.cancel.bind(this);
    this.cancelAll = this.cancelAll.bind(this);
  }

  /** Registers one pending approval before its part is published to reactive consumers. */
  approval(part: ChatApprovalPart): ChatInteractionHandle<ChatApprovalResult> {
    const result = new Promise<ChatApprovalResult>((resolve) => {
      this.pending.set(part.id, {part, resolve});
    });
    return {id: part.id, result};
  }

  /** Registers one pending question set before its part is published. */
  questions(part: ChatQuestionPart): ChatInteractionHandle<ChatQuestionsResult> {
    const result = new Promise<ChatQuestionsResult>((resolve) => {
      this.pending.set(part.id, {part, resolve});
    });
    return {id: part.id, result};
  }

  /** Settles a matching approval once and notifies turn completion. */
  resolveApproval(id: string, decision: ChatApprovalDecision) {
    const item = this.pending.get(id);
    if (
      !item ||
      item.part.type !== 'approval' ||
      (decision !== 'allow' && decision !== 'deny')
    )
      return false;
    item.part.status = 'answered';
    item.part.decision = decision;
    this.pending.delete(id);
    (item.resolve as (result: ChatApprovalResult) => void)({
      status: 'answered',
      decision,
    });
    this.onSettled();
    return true;
  }

  /** Validates and snapshots answers before settling a matching question set. */
  answerQuestions(id: string, answers: ChatQuestionAnswer[]) {
    const item = this.pending.get(id);
    if (!item || item.part.type !== 'question') return false;
    const normalized = validateAnswers(item.part.questions, answers);
    if (!normalized) return false;
    item.part.status = 'answered';
    item.part.answers = normalized;
    this.pending.delete(id);
    (item.resolve as (result: ChatQuestionsResult) => void)({
      status: 'answered',
      answers: normalized.map((answer) => ({
        ...answer,
        choiceIds: [...answer.choiceIds],
      })),
    });
    this.onSettled();
    return true;
  }

  /** Cancels one pending interaction, optionally notifying the response owner. */
  cancel(id: string, notify = true) {
    const item = this.pending.get(id);
    if (!item) return false;
    item.part.status = 'cancelled';
    this.pending.delete(id);
    item.resolve({status: 'cancelled'});
    if (notify) this.onSettled();
    return true;
  }

  /** Settles every pending result as cancelled without recursively completing the turn. */
  cancelAll(): void {
    for (const id of this.pending.keys()) this.cancel(id, false);
  }

  /** Number of unsettled interactions blocking successful completion. */
  get size(): number {
    return this.pending.size;
  }
}

/** Creates the same per-turn interaction collection through the existing helper. */
export function createChatInteractions(
  onSettled: () => void
): Pick<ChatInteractions, keyof ChatInteractions> {
  return new ChatInteractions(onSettled);
}
