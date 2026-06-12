import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation } from '@nozbe/watermelondb/decorators';

export default class ReturnEntry extends Model {
  static table = 'return_entries';

  @text('original_answer_id') originalAnswerId: string;
  @text('player_id') playerId: string;
  @text('session_id') sessionId: string;
  @text('reflection_text') reflectionText: string;
}
