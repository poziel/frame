import {expect, test} from 'bun:test';
import {
  copyChatMessages,
  copyChatPart,
} from '../packages/core/src/modules/chat/services/content/chatParts';
import type {
  ChatMessage,
  ChatQuestionPart,
} from '../packages/core/src/modules/chat/types/chatTypes';

test('message snapshots isolate nested question state while retaining host resource identities', () => {
  const file = new File(['data'], 'context.txt');
  const question: ChatQuestionPart = {
    id: 'questions',
    type: 'question',
    text: 'Choose',
    status: 'answered',
    questions: [
      {id: 'color', text: 'Color?', choices: [{id: 'blue', label: 'Blue'}]},
    ],
    answers: [{questionId: 'color', choiceIds: ['blue']}],
  };
  const source: ChatMessage[] = [
    {
      id: 'message',
      role: 'assistant',
      createdAt: 1,
      status: 'complete',
      parts: [
        question,
        {
          id: 'image',
          type: 'artifact',
          name: 'Preview',
          kind: 'image',
          url: 'blob:host-owned',
          text: 'Caption',
        },
      ],
      attachments: [
        {id: 'attachment', name: 'Context', kind: 'file', files: [file]},
      ],
    },
  ];
  const snapshot = copyChatMessages(source);
  expect(snapshot).toEqual(source);
  expect(snapshot[0]?.attachments[0]?.files?.[0]).toBe(file);
  const copiedQuestion = snapshot[0]!.parts[0] as ChatQuestionPart;
  copiedQuestion.questions[0]!.choices[0]!.label = 'Changed';
  copiedQuestion.answers![0]!.choiceIds.push('other');
  snapshot[0]!.attachments[0]!.files!.pop();
  snapshot[0]!.parts.pop();
  expect(question.questions[0]?.choices[0]?.label).toBe('Blue');
  expect(question.answers?.[0]?.choiceIds).toEqual(['blue']);
  expect(source[0]?.attachments[0]?.files).toHaveLength(1);
  expect(source[0]?.parts).toHaveLength(2);
  expect((snapshot[0]!.parts[0] as ChatQuestionPart).questions).not.toBe(
    question.questions
  );
});

test('copying a scalar part preserves its data without retaining the source object', () => {
  const part = {
    id: 'progress',
    type: 'message' as const,
    text: 'Working',
    phase: 'intermediate' as const,
  };
  const copy = copyChatPart(part);
  expect(copy).toEqual(part);
  expect(copy).not.toBe(part);
  copy.text = 'Changed';
  expect(part.text).toBe('Working');
});
