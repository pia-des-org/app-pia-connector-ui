import {Component, HostBinding, Input} from "@angular/core";
import {FormControl} from "@angular/forms";
import {LanguageSelectItem} from "./language-select-item";
import {LanguageSelectItemService} from "./language-select-item.service";

/**
 * Language selection component.
 */
@Component({
  selector: 'language-select',
  templateUrl: 'language-select.component.html',
  styleUrls: ['./language-select.component.scss']
})
export class LanguageSelectComponent {
  @Input()
  label!: string;

  @Input()
  control!: FormControl<LanguageSelectItem | null>;

  /**
   * Provides the list of available language options.
   */
  constructor(public items: LanguageSelectItemService) {}

  /**
   * Comparison function for language options.
   * Used by Angular Material to track selection changes correctly.
   * @param a First language item
   * @param b Second language item
   */
  compareWith(
    a: LanguageSelectItem | null,
    b: LanguageSelectItem | null,
  ): boolean {
    return a?.id === b?.id;
  }
}
