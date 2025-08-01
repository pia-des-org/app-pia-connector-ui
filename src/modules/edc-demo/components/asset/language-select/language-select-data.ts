import {LanguageSelectItem} from './language-select-item';

/**
 * Static list of available languages used by the LanguageSelectComponent.
 *
 * Each entry is a LanguageSelectItem containing:
 * - `id`: ISO 639-1 code (or 'MULTI_LINGUAL' for mixed content)
 * - `label`: Display name for the language
 * - `comment` (optional): Explanation for special cases
 * - `sameAs` (optional): Link to DBpedia resource for the language
 *
 * This data is used by LanguageSelectItemService to populate language dropdowns.
 */

export const LANGUAGE_SELECT_DATA: LanguageSelectItem[] = [
  {
    id: 'MULTI_LINGUAL',
    label: 'Multilingual',
    comment:
      'Code indicates that several languages are used or no concrete language can be determined.',
  },

  {
    id: 'AB',
    label: 'Abkhaz',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ab',
  },

  {
    id: 'AA',
    label: 'Afar',
    sameAs: 'https://dbpedia.org/resource/ISO_639:aa',
  },

  {
    id: 'AF',
    label: 'Afrikaans',
    sameAs: 'https://dbpedia.org/resource/ISO_639:af',
  },

  {
    id: 'AK',
    label: 'Akan',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ak',
  },

  {
    id: 'SQ',
    label: 'Albanian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sq',
  },

  {
    id: 'AM',
    label: 'Amharic',
    sameAs: 'https://dbpedia.org/resource/ISO_639:am',
  },

  {
    id: 'AR',
    label: 'Arabic',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ar',
  },

  {
    id: 'AN',
    label: 'Aragonese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:an',
  },

  {
    id: 'HY',
    label: 'Armenian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:hy',
  },

  {
    id: 'AS',
    label: 'Assamese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:as',
  },

  {
    id: 'AV',
    label: 'Avaric',
    sameAs: 'https://dbpedia.org/resource/ISO_639:av',
  },

  {
    id: 'AE',
    label: 'Avestan',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ae',
  },

  {
    id: 'AY',
    label: 'Aymara',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ay',
  },

  {
    id: 'AZ',
    label: 'Azerbaijani',
    sameAs: 'https://dbpedia.org/resource/ISO_639:az',
  },

  {
    id: 'BM',
    label: 'Bambara',
    sameAs: 'https://dbpedia.org/resource/ISO_639:bm',
  },

  {
    id: 'BA',
    label: 'Bashkir',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ba',
  },

  {
    id: 'EU',
    label: 'Basque',
    sameAs: 'https://dbpedia.org/resource/ISO_639:eu',
  },

  {
    id: 'BE',
    label: 'Belarusian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:be',
  },

  {
    id: 'BN',
    label: 'Bengali, Bangla',
    sameAs: 'https://dbpedia.org/resource/ISO_639:bn',
  },

  {
    id: 'BH',
    label: 'Bihari',
    sameAs: 'https://dbpedia.org/resource/ISO_639:bh',
  },

  {
    id: 'BI',
    label: 'Bislama',
    sameAs: 'https://dbpedia.org/resource/ISO_639:bi',
  },

  {
    id: 'BS',
    label: 'Bosnian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:bs',
  },

  {
    id: 'BR',
    label: 'Breton',
    sameAs: 'https://dbpedia.org/resource/ISO_639:br',
  },

  {
    id: 'BG',
    label: 'Bulgarian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:bg',
  },

  {
    id: 'MY',
    label: 'Burmese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:my',
  },

  {
    id: 'CA',
    label: 'Catalan',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ca',
  },

  {
    id: 'CH',
    label: 'Chamorro',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ch',
  },

  {
    id: 'CE',
    label: 'Chechen',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ce',
  },

  {
    id: 'NY',
    label: 'Chichewa, Chewa, Nyanja',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ny',
  },

  {
    id: 'ZH',
    label: 'Chinese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:zh',
  },

  {
    id: 'CV',
    label: 'Chuvash',
    sameAs: 'https://dbpedia.org/resource/ISO_639:cv',
  },

  {
    id: 'KW',
    label: 'Cornish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kw',
  },

  {
    id: 'CO',
    label: 'Corsican',
    sameAs: 'https://dbpedia.org/resource/ISO_639:co',
  },

  {
    id: 'CR',
    label: 'Cree',
    sameAs: 'https://dbpedia.org/resource/ISO_639:cr',
  },

  {
    id: 'HR',
    label: 'Croatian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:hr',
  },

  {
    id: 'CS',
    label: 'Czech',
    sameAs: 'https://dbpedia.org/resource/ISO_639:cs',
  },

  {
    id: 'DA',
    label: 'Danish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:da',
  },

  {
    id: 'DV',
    label: 'Divehi, Dhivehi, Maldivian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:dv',
  },

  {
    id: 'NL',
    label: 'Dutch',
    sameAs: 'https://dbpedia.org/resource/ISO_639:nl',
  },

  {
    id: 'DZ',
    label: 'Dzongkha',
    sameAs: 'https://dbpedia.org/resource/ISO_639:dz',
  },

  {
    id: 'EN',
    label: 'English',
    sameAs: 'https://dbpedia.org/resource/ISO_639:en',
  },

  {
    id: 'EO',
    label: 'Esperanto',
    sameAs: 'https://dbpedia.org/resource/ISO_639:eo',
  },

  {
    id: 'ET',
    label: 'Estonian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:et',
  },

  {
    id: 'EE',
    label: 'Ewe',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ee',
  },

  {
    id: 'FO',
    label: 'Faroese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:fo',
  },

  {
    id: 'FJ',
    label: 'Fijian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:fj',
  },

  {
    id: 'FI',
    label: 'Finnish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:fi',
  },

  {
    id: 'FR',
    label: 'French',
    sameAs: 'https://dbpedia.org/resource/ISO_639:fr',
  },

  {
    id: 'FF',
    label: 'Fula, Fulah, Pulaar, Pular',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ff',
  },

  {
    id: 'GL',
    label: 'Galician',
    sameAs: 'https://dbpedia.org/resource/ISO_639:gl',
  },

  {
    id: 'KA',
    label: 'Georgian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ka',
  },

  {
    id: 'DE',
    label: 'German',
    sameAs: 'https://dbpedia.org/resource/ISO_639:de',
  },

  {
    id: 'EL',
    label: 'Greek (modern)',
    sameAs: 'https://dbpedia.org/resource/ISO_639:el',
  },

  {
    id: 'GN',
    label: 'Guaraní',
    sameAs: 'https://dbpedia.org/resource/ISO_639:gn',
  },

  {
    id: 'GU',
    label: 'Gujarati',
    sameAs: 'https://dbpedia.org/resource/ISO_639:gu',
  },

  {
    id: 'HT',
    label: 'Haitian, Haitian Creole',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ht',
  },

  {
    id: 'HA',
    label: 'Hausa',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ha',
  },

  {
    id: 'HE',
    label: 'Hebrew (modern)',
    sameAs: 'https://dbpedia.org/resource/ISO_639:he',
  },

  {
    id: 'HZ',
    label: 'Herero',
    sameAs: 'https://dbpedia.org/resource/ISO_639:hz',
  },

  {
    id: 'HI',
    label: 'Hindi',
    sameAs: 'https://dbpedia.org/resource/ISO_639:hi',
  },

  {
    id: 'HO',
    label: 'Hiri Motu',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ho',
  },

  {
    id: 'HU',
    label: 'Hungarian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:hu',
  },

  {
    id: 'IA',
    label: 'Interlingua',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ia',
  },

  {
    id: 'ID',
    label: 'Indonesian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:id',
  },

  {
    id: 'IE',
    label: 'Interlingue',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ie',
  },

  {
    id: 'GA',
    label: 'Irish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ga',
  },

  {
    id: 'IG',
    label: 'Igbo',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ig',
  },

  {
    id: 'IK',
    label: 'Inupiaq',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ik',
  },

  {
    id: 'IO',
    label: 'Ido',
    sameAs: 'https://dbpedia.org/resource/ISO_639:io',
  },

  {
    id: 'IS',
    label: 'Icelandic',
    sameAs: 'https://dbpedia.org/resource/ISO_639:is',
  },

  {
    id: 'IT',
    label: 'Italian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:it',
  },

  {
    id: 'IU',
    label: 'Inuktitut',
    sameAs: 'https://dbpedia.org/resource/ISO_639:iu',
  },

  {
    id: 'JA',
    label: 'Japanese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ja',
  },

  {
    id: 'JV',
    label: 'Javanese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:jv',
  },

  {
    id: 'KL',
    label: 'Kalaallisut, Greenlandic',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kl',
  },

  {
    id: 'KN',
    label: 'Kannada',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kn',
  },

  {
    id: 'KR',
    label: 'Kanuri',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kr',
  },

  {
    id: 'KS',
    label: 'Kashmiri',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ks',
  },

  {
    id: 'KK',
    label: 'Kazakh',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kk',
  },

  {
    id: 'KM',
    label: 'Khmer',
    sameAs: 'https://dbpedia.org/resource/ISO_639:km',
  },

  {
    id: 'KI',
    label: 'Kikuyu, Gikuyu',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ki',
  },

  {
    id: 'RW',
    label: 'Kinyarwanda',
    sameAs: 'https://dbpedia.org/resource/ISO_639:rw',
  },

  {
    id: 'KY',
    label: 'Kyrgyz',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ky',
  },

  {
    id: 'KV',
    label: 'Komi',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kv',
  },

  {
    id: 'KG',
    label: 'Kongo',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kg',
  },

  {
    id: 'KO',
    label: 'Korean',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ko',
  },

  {
    id: 'KU',
    label: 'Kurdish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ku',
  },

  {
    id: 'KJ',
    label: 'Kwanyama, Kuanyama',
    sameAs: 'https://dbpedia.org/resource/ISO_639:kj',
  },

  {
    id: 'LA',
    label: 'Latin',
    sameAs: 'https://dbpedia.org/resource/ISO_639:la',
  },

  {
    id: 'LB',
    label: 'Luxembourgish, Letzeburgesch',
    sameAs: 'https://dbpedia.org/resource/ISO_639:lb',
  },

  {
    id: 'LG',
    label: 'Ganda',
    sameAs: 'https://dbpedia.org/resource/ISO_639:lg',
  },

  {
    id: 'LI',
    label: 'Limburgish, Limburgan, Limburger',
    sameAs: 'https://dbpedia.org/resource/ISO_639:li',
  },

  {
    id: 'LN',
    label: 'Lingala',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ln',
  },

  {
    id: 'LO',
    label: 'Lao',
    sameAs: 'https://dbpedia.org/resource/ISO_639:lo',
  },

  {
    id: 'LT',
    label: 'Lithuanian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:lt',
  },

  {
    id: 'LU',
    label: 'Luba-Katanga',
    sameAs: 'https://dbpedia.org/resource/ISO_639:lu',
  },

  {
    id: 'LV',
    label: 'Latvian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:lv',
  },

  {
    id: 'GV',
    label: 'Manx',
    sameAs: 'https://dbpedia.org/resource/ISO_639:gv',
  },

  {
    id: 'MK',
    label: 'Macedonian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:mk',
  },

  {
    id: 'MG',
    label: 'Malagasy',
    sameAs: 'https://dbpedia.org/resource/ISO_639:mg',
  },

  {
    id: 'MS',
    label: 'Malay',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ms',
  },

  {
    id: 'ML',
    label: 'Malayalam',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ml',
  },

  {
    id: 'MT',
    label: 'Maltese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:mt',
  },

  {
    id: 'MI',
    label: 'Māori',
    sameAs: 'https://dbpedia.org/resource/ISO_639:mi',
  },

  {
    id: 'MR',
    label: 'Marathi (Marāṭhī)',
    sameAs: 'https://dbpedia.org/resource/ISO_639:mr',
  },

  {
    id: 'MH',
    label: 'Marshallese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:mh',
  },

  {
    id: 'MN',
    label: 'Mongolian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:mn',
  },

  {
    id: 'NA',
    label: 'Nauruan',
    sameAs: 'https://dbpedia.org/resource/ISO_639:na',
  },

  {
    id: 'NV',
    label: 'Navajo, Navaho',
    sameAs: 'https://dbpedia.org/resource/ISO_639:nv',
  },

  {
    id: 'ND',
    label: 'Northern Ndebele',
    sameAs: 'https://dbpedia.org/resource/ISO_639:nd',
  },

  {
    id: 'NE',
    label: 'Nepali',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ne',
  },

  {
    id: 'NG',
    label: 'Ndonga',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ng',
  },

  {
    id: 'NB',
    label: 'Norwegian Bokmål',
    sameAs: 'https://dbpedia.org/resource/ISO_639:nb',
  },

  {
    id: 'NN',
    label: 'Norwegian Nynorsk',
    sameAs: 'https://dbpedia.org/resource/ISO_639:nn',
  },

  {
    id: 'NO',
    label: 'Norwegian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:no',
  },

  {
    id: 'II',
    label: 'Nuosu',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ii',
  },

  {
    id: 'NR',
    label: 'Southern Ndebele',
    sameAs: 'https://dbpedia.org/resource/ISO_639:nr',
  },

  {
    id: 'OC',
    label: 'Occitan',
    sameAs: 'https://dbpedia.org/resource/ISO_639:oc',
  },

  {
    id: 'OJ',
    label: 'Ojibwe, Ojibwa',
    sameAs: 'https://dbpedia.org/resource/ISO_639:oj',
  },

  {
    id: 'CU',
    label: 'Old Church Slavonic, Church Slavonic, Old Bulgarian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:cu',
  },

  {
    id: 'OM',
    label: 'Oromo',
    sameAs: 'https://dbpedia.org/resource/ISO_639:om',
  },

  {
    id: 'OR',
    label: 'Oriya',
    sameAs: 'https://dbpedia.org/resource/ISO_639:or',
  },

  {
    id: 'OS',
    label: 'Ossetian, Ossetic',
    sameAs: 'https://dbpedia.org/resource/ISO_639:os',
  },

  {
    id: 'PA',
    label: '(Eastern) Punjabi',
    sameAs: 'https://dbpedia.org/resource/ISO_639:pa',
  },

  {
    id: 'PI',
    label: 'Pāli',
    sameAs: 'https://dbpedia.org/resource/ISO_639:pi',
  },

  {
    id: 'FA',
    label: 'Persian (Farsi)',
    sameAs: 'https://dbpedia.org/resource/ISO_639:fa',
  },

  {
    id: 'PL',
    label: 'Polish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:pl',
  },

  {
    id: 'PS',
    label: 'Pashto, Pushto',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ps',
  },

  {
    id: 'PT',
    label: 'Portuguese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:pt',
  },

  {
    id: 'QU',
    label: 'Quechua',
    sameAs: 'https://dbpedia.org/resource/ISO_639:qu',
  },

  {
    id: 'RM',
    label: 'Romansh',
    sameAs: 'https://dbpedia.org/resource/ISO_639:rm',
  },

  {
    id: 'RN',
    label: 'Kirundi',
    sameAs: 'https://dbpedia.org/resource/ISO_639:rn',
  },

  {
    id: 'RO',
    label: 'Romanian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ro',
  },

  {
    id: 'RU',
    label: 'Russian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ru',
  },

  {
    id: 'SA',
    label: 'Sanskrit (Saṁskṛta)',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sa',
  },

  {
    id: 'SC',
    label: 'Sardinian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sc',
  },

  {
    id: 'SD',
    label: 'Sindhi',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sd',
  },

  {
    id: 'SE',
    label: 'Northern Sami',
    sameAs: 'https://dbpedia.org/resource/ISO_639:se',
  },

  {
    id: 'SM',
    label: 'Samoan',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sm',
  },

  {
    id: 'SG',
    label: 'Sango',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sg',
  },

  {
    id: 'SR',
    label: 'Serbian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sr',
  },

  {
    id: 'GD',
    label: 'Scottish Gaelic, Gaelic',
    sameAs: 'https://dbpedia.org/resource/ISO_639:gd',
  },

  {
    id: 'SN',
    label: 'Shona',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sn',
  },

  {
    id: 'SI',
    label: 'Sinhalese, Sinhala',
    sameAs: 'https://dbpedia.org/resource/ISO_639:si',
  },

  {
    id: 'SK',
    label: 'Slovak',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sk',
  },

  {
    id: 'SL',
    label: 'Slovene',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sl',
  },

  {
    id: 'SO',
    label: 'Somali',
    sameAs: 'https://dbpedia.org/resource/ISO_639:so',
  },

  {
    id: 'ST',
    label: 'outhern Sotho',
    sameAs: 'https://dbpedia.org/resource/ISO_639:st',
  },

  {
    id: 'ES',
    label: 'Spanish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:es',
  },

  {
    id: 'SU',
    label: 'Sundanese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:su',
  },

  {
    id: 'SW',
    label: 'Swahili',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sw',
  },

  {
    id: 'SS',
    label: 'Swati',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ss',
  },

  {
    id: 'SV',
    label: 'Swedish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:sv',
  },

  {
    id: 'TA',
    label: 'Tamil',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ta',
  },

  {
    id: 'TE',
    label: 'Telugu',
    sameAs: 'https://dbpedia.org/resource/ISO_639:te',
  },

  {
    id: 'TG',
    label: 'Tajik',
    sameAs: 'https://dbpedia.org/resource/ISO_639:tg',
  },

  {
    id: 'TH',
    label: 'Thai',
    sameAs: 'https://dbpedia.org/resource/ISO_639:th',
  },

  {
    id: 'TI',
    label: 'Tigrinya',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ti',
  },

  {
    id: 'BO',
    label: 'Tibetan Standard, Tibetan, Central',
    sameAs: 'https://dbpedia.org/resource/ISO_639:bo',
  },

  {
    id: 'TK',
    label: 'Turkmen',
    sameAs: 'https://dbpedia.org/resource/ISO_639:tk',
  },

  {
    id: 'TL',
    label: 'Tagalog',
    sameAs: 'https://dbpedia.org/resource/ISO_639:tl',
  },

  {
    id: 'TN',
    label: 'Tswana',
    sameAs: 'https://dbpedia.org/resource/ISO_639:tn',
  },

  {
    id: 'TO',
    label: 'Tonga (Tonga Islands)',
    sameAs: 'https://dbpedia.org/resource/ISO_639:to',
  },

  {
    id: 'TR',
    label: 'Turkish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:tr',
  },

  {
    id: 'TS',
    label: 'Tsonga',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ts',
  },

  {
    id: 'TT',
    label: 'Tatar',
    sameAs: 'https://dbpedia.org/resource/ISO_639:tt',
  },

  {
    id: 'TW',
    label: 'Twi',
    sameAs: 'https://dbpedia.org/resource/ISO_639:tw',
  },

  {
    id: 'TY',
    label: 'Tahitian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ty',
  },

  {
    id: 'UG',
    label: 'Uyghur',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ug',
  },

  {
    id: 'UK',
    label: 'Ukrainian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:uk',
  },

  {
    id: 'UR',
    label: 'Urdu',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ur',
  },

  {
    id: 'UZ',
    label: 'Uzbek',
    sameAs: 'https://dbpedia.org/resource/ISO_639:uz',
  },

  {
    id: 'VE',
    label: 'Venda',
    sameAs: 'https://dbpedia.org/resource/ISO_639:ve',
  },

  {
    id: 'VI',
    label: 'Vietnamese',
    sameAs: 'https://dbpedia.org/resource/ISO_639:vi',
  },

  {
    id: 'VO',
    label: 'Volapük',
    sameAs: 'https://dbpedia.org/resource/ISO_639:vo',
  },

  {
    id: 'WA',
    label: 'Walloon',
    sameAs: 'https://dbpedia.org/resource/ISO_639:wa',
  },

  {
    id: 'CY',
    label: 'Welsh',
    sameAs: 'https://dbpedia.org/resource/ISO_639:cy',
  },

  {
    id: 'WO',
    label: 'Wolof',
    sameAs: 'https://dbpedia.org/resource/ISO_639:wo',
  },

  {
    id: 'FY',
    label: 'Western Frisian',
    sameAs: 'https://dbpedia.org/resource/ISO_639:fy',
  },

  {
    id: 'XH',
    label: 'Xhosa',
    sameAs: 'https://dbpedia.org/resource/ISO_639:xh',
  },

  {
    id: 'YI',
    label: 'Yiddish',
    sameAs: 'https://dbpedia.org/resource/ISO_639:yi',
  },

  {
    id: 'YO',
    label: 'Yoruba',
    sameAs: 'https://dbpedia.org/resource/ISO_639:yo',
  },

  {
    id: 'ZA',
    label: 'Zhuang, Chuang',
    sameAs: 'https://dbpedia.org/resource/ISO_639:za',
  },

  {
    id: 'ZU',
    label: 'Zulu',
    sameAs: 'https://dbpedia.org/resource/ISO_639:zu',
  },
];
