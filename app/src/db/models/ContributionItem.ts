import { Model } from '@nozbe/watermelondb';
import { field, text, date, relation } from '@nozbe/watermelondb/decorators';

export default class ContributionItem extends Model {
  static table = 'contribution_items';

  @text('player_id') playerId: string;
  @text('session_id') sessionId: string;
  @text('archetype') archetype: string;
  @text('item_data') itemData: string;
}
