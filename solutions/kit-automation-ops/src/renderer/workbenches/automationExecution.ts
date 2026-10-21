export type AutomationActorType = 'agent' | 'tool' | 'human';

export type AutomationStepReceipt = {
  actor?: string;
  actorId?: string;
  actorType?: AutomationActorType;
  tool?: string;
  evidence?: string;
  output?: string;
};

export type AutomationExecutionContext = {
  runId: string;
  signal: AbortSignal;
  throwIfCancelled: () => void;
  registerCancellation: (cancel: () => void | Promise<void>) => () => void;
};

export type AutomationStepReporter = (
  index: number,
  note?: string,
  receipt?: AutomationStepReceipt,
) => void;
