import {Injectable} from '@angular/core';
import {LANGUAGE_SELECT_DATA} from './language-select-data';
import {LanguageSelectItem} from './language-select-item';

/**
 * Access list of available LanguageSelectItems
 */
@Injectable({providedIn: 'root'})
export class LanguageSelectItemService {
  /**
   * Partition LanguageSelectItems into highlighted and other.
   * Usability: See important options first and close to each other.
   */
  highlightItemIds = [
    'MULTI_LINGUAL',
    'DE',
    'DE',
    'EN',
  ];
  highlightItems: LanguageSelectItem[];
  otherItems: LanguageSelectItem[];
  itemsById = this.associateBy(LANGUAGE_SELECT_DATA, (it) => it.id);

  constructor() {
    this.highlightItems = this.buildHighlightItems();
    this.otherItems = this.buildOtherItems();
  }

  /**
   * Find LanguageSelectItem by id
   * @param id language select item id
   */
  findById(id: string): LanguageSelectItem {
    const item = this.itemsById.get(id);
    if (item != null) {
      return item;
    }
    return {
      id,
      label: `Unknown (${id})`,
    };
  }

  english(): LanguageSelectItem {
    return this.findById('https://w3id.org/idsa/code/EN');
  }

  private buildHighlightItems(): LanguageSelectItem[] {
    return LANGUAGE_SELECT_DATA.filter((it) =>
      this.highlightItemIds.includes(it.id),
    );
  }

  private buildOtherItems(): LanguageSelectItem[] {
    return LANGUAGE_SELECT_DATA.filter(
      (it) => !this.highlightItemIds.includes(it.id),
    );
  }

  private associateBy<T, K>(
    array: T[],
    keyExtractor: (it: T) => K,
  ): Map<K, T> {
    return new Map(array.map((it) => [keyExtractor(it), it]));
  }
}
