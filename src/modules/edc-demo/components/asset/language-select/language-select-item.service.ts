import {Injectable} from '@angular/core';
import {LANGUAGE_SELECT_DATA} from './language-select-data';
import {LanguageSelectItem} from './language-select-item';

/**
 * Provides access to the available language selection items
 * and organizes them into highlighted and non-highlighted categories.
 */
@Injectable({providedIn: 'root'})
export class LanguageSelectItemService {
  /**
   * List of language IDs considered important and shown at the top of the dropdown.
   * This improves usability by keeping common or preferred options easily accessible.
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
   * Finds a language item by its ID.
   * If not found, returns a fallback item labeled "Unknown".
   *
   * @param id The ID of the language to look up
   * @returns The matching LanguageSelectItem or a placeholder fallback
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

  /**
   * Shortcut to retrieve the English language item.
   */
  english(): LanguageSelectItem {
    return this.findById('https://w3id.org/idsa/code/EN');
  }

  /**
   * Builds the list of highlighted language items.
   */
  private buildHighlightItems(): LanguageSelectItem[] {
    return LANGUAGE_SELECT_DATA.filter((it) =>
      this.highlightItemIds.includes(it.id),
    );
  }

  /**
   * Builds the list of language items that are not highlighted.
   */
  private buildOtherItems(): LanguageSelectItem[] {
    return LANGUAGE_SELECT_DATA.filter(
      (it) => !this.highlightItemIds.includes(it.id),
    );
  }

  /**
   * Creates a Map from an array of objects using a custom key extractor.
   *
   * @param array The array to map
   * @param keyExtractor Function that returns the key for each item
   * @returns A Map of items indexed by the extracted key
   */
  private associateBy<T, K>(
    array: T[],
    keyExtractor: (it: T) => K,
  ): Map<K, T> {
    return new Map(array.map((it) => [keyExtractor(it), it]));
  }
}
