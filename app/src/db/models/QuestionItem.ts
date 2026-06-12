import { Model } from '@nozbe/watermelondb';
import { field, text, date } from '@nozbe/watermelondb/decorators';

export default class QuestionItem extends Model {
  static table = 'question_items';

  @text('text') text: string;
  @text('lineage') lineage: string;
  @text('register') register: string;
  @text('domain') domain: string;
  @field('is_active') isActive: boolean;
}
