import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation } from '@nozbe/watermelondb/decorators';

export default class ChainEntry extends Model {
  static table = 'chain_entries';

  @text('question_id') questionId: string;
  @text('player_id') playerId: string;
  @text('session_id') sessionId: string;
  @field('turn_number') turnNumber: number;
  @text('answer_text') answerText: string;
  @date('timestamp') timestamp: number;
}
