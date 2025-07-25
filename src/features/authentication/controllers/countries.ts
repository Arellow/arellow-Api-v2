import { NextFunction, Request, Response } from "express"
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";

export const CountriesCode = [
  { Dial: "+1", Flag: "🇨🇦", Code: "CA", Name: "Canada" },
  { Dial: "+1", Flag: "🇺🇸", Code: "US", Name: "United States" },
  { Dial: "+1242", Flag: "🇧🇸", Code: "BS", Name: "Bahamas" },
  { Dial: "+1246", Flag: "🇧🇧", Code: "BB", Name: "Barbados" },
  { Dial: "+1264", Flag: "🇦🇮", Code: "AI", Name: "Anguilla" },
  { Dial: "+1268", Flag: "🇦🇬", Code: "AG", Name: "Antigua and Barbuda" },
  { Dial: "+1284", Flag: "🇻🇬", Code: "VG", Name: "Virgin Islands, British" },
  { Dial: "+1340", Flag: "🇻🇮", Code: "VI", Name: "Virgin Islands, U.S." },
  { Dial: "+1441", Flag: "🇧🇲", Code: "BM", Name: "Bermuda" },
  { Dial: "+1473", Flag: "🇬🇩", Code: "GD", Name: "Grenada" },
  { Dial: "+1649", Flag: "🇹🇨", Code: "TC", Name: "Turks and Caicos Islands" },
  { Dial: "+1664", Flag: "🇲🇸", Code: "MS", Name: "Montserrat" },
  { Dial: "+1670", Flag: "🇲🇵", Code: "MP", Name: "Northern Mariana Islands" },
  { Dial: "+1671", Flag: "🇬🇺", Code: "GU", Name: "Guam" },
  { Dial: "+1684", Flag: "🇦🇸", Code: "AS", Name: "American Samoa" },
  { Dial: "+1758", Flag: "🇱🇨", Code: "LC", Name: "Saint Lucia" },
  { Dial: "+1767", Flag: "🇩🇲", Code: "DM", Name: "Dominica" },
  { Dial: "+1784", Flag: "🇻🇨", Code: "VC", Name: "Saint Vincent and the Grenadines" },
  { Dial: "+1849", Flag: "🇩🇴", Code: "DO", Name: "Dominican Republic" },
  { Dial: "+1868", Flag: "🇹🇹", Code: "TT", Name: "Trinidad and Tobago" },
  { Dial: "+1869", Flag: "🇰🇳", Code: "KN", Name: "Saint Kitts and Nevis" },
  { Dial: "+1876", Flag: "🇯🇲", Code: "JM", Name: "Jamaica" },
  { Dial: "+1939", Flag: "🇵🇷", Code: "PR", Name: "Puerto Rico" },
  { Dial: "+20", Flag: "🇪🇬", Code: "EG", Name: "Egypt" },
  { Dial: "+211", Flag: "🇸🇸", Code: "SS", Name: "South Sudan" },
  { Dial: "+212", Flag: "🇲🇦", Code: "MA", Name: "Morocco" },
  { Dial: "+213", Flag: "🇩🇿", Code: "DZ", Name: "Algeria" },
  { Dial: "+216", Flag: "🇹🇳", Code: "TN", Name: "Tunisia" },
  { Dial: "+218", Flag: "🇱🇾", Code: "LY", Name: "Libyan Arab Jamahiriya" },
  { Dial: "+220", Flag: "🇬🇲", Code: "GM", Name: "Gambia" },
  { Dial: "+221", Flag: "🇸🇳", Code: "SN", Name: "Senegal" },
  { Dial: "+222", Flag: "🇲🇷", Code: "MR", Name: "Mauritania" },
  { Dial: "+223", Flag: "🇲🇱", Code: "ML", Name: "Mali" },
  { Dial: "+224", Flag: "🇬🇳", Code: "GN", Name: "Guinea" },
  { Dial: "+225", Flag: "🇨🇮", Code: "CI", Name: "Cote d'Ivoire" },
  { Dial: "+226", Flag: "🇧🇫", Code: "BF", Name: "Burkina Faso" },
  { Dial: "+227", Flag: "🇳🇪", Code: "NE", Name: "Niger" },
  { Dial: "+228", Flag: "🇹🇬", Code: "TG", Name: "Togo" },
  { Dial: "+229", Flag: "🇧🇯", Code: "BJ", Name: "Benin" },
  { Dial: "+230", Flag: "🇲🇺", Code: "MU", Name: "Mauritius" },
  { Dial: "+231", Flag: "🇱🇷", Code: "LR", Name: "Liberia" },
  { Dial: "+232", Flag: "🇸🇱", Code: "SL", Name: "Sierra Leone" },
  { Dial: "+233", Flag: "🇬🇭", Code: "GH", Name: "Ghana" },
  { Dial: "+234", Flag: "🇳🇬", Code: "NG", Name: "Nigeria" },
  { Dial: "+235", Flag: "🇹🇩", Code: "TD", Name: "Chad" },
  { Dial: "+236", Flag: "🇨🇫", Code: "CF", Name: "Central African Republic" },
  { Dial: "+237", Flag: "🇨🇲", Code: "CM", Name: "Cameroon" },
  { Dial: "+238", Flag: "🇨🇻", Code: "CV", Name: "Cape Verde" },
  { Dial: "+239", Flag: "🇸🇹", Code: "ST", Name: "Sao Tome and Principe" },
  { Dial: "+240", Flag: "🇬🇶", Code: "GQ", Name: "Equatorial Guinea" },
  { Dial: "+241", Flag: "🇬🇦", Code: "GA", Name: "Gabon" },
  { Dial: "+242", Flag: "🇨🇬", Code: "CG", Name: "Congo" },
  { Dial: "+243", Flag: "🇨🇩", Code: "CD", Name: "Congo, The Democratic Republic of the Congo" },
  { Dial: "+244", Flag: "🇦🇴", Code: "AO", Name: "Angola" },
  { Dial: "+245", Flag: "🇬🇼", Code: "GW", Name: "Guinea-Bissau" },
  { Dial: "+246", Flag: "🇮🇴", Code: "IO", Name: "British Indian Ocean Territory" },
  { Dial: "+248", Flag: "🇸🇨", Code: "SC", Name: "Seychelles" },
  { Dial: "+249", Flag: "🇸🇩", Code: "SD", Name: "Sudan" },
  { Dial: "+250", Flag: "🇷🇼", Code: "RW", Name: "Rwanda" },
  { Dial: "+251", Flag: "🇪🇹", Code: "ET", Name: "Ethiopia" },
  { Dial: "+252", Flag: "🇸🇴", Code: "SO", Name: "Somalia" },
  { Dial: "+253", Flag: "🇩🇯", Code: "DJ", Name: "Djibouti" },
  { Dial: "+254", Flag: "🇰🇪", Code: "KE", Name: "Kenya" },
  { Dial: "+255", Flag: "🇹🇿", Code: "TZ", Name: "Tanzania, United Republic of Tanzania" },
  { Dial: "+256", Flag: "🇺🇬", Code: "UG", Name: "Uganda" },
  { Dial: "+257", Flag: "🇧🇮", Code: "BI", Name: "Burundi" },
  { Dial: "+258", Flag: "🇲🇿", Code: "MZ", Name: "Mozambique" },
  { Dial: "+260", Flag: "🇿🇲", Code: "ZM", Name: "Zambia" },
  { Dial: "+261", Flag: "🇲🇬", Code: "MG", Name: "Madagascar" },
  { Dial: "+262", Flag: "🇹🇫", Code: "TF", Name: "French Southern Territories" },
  { Dial: "+262", Flag: "🇾🇹", Code: "YT", Name: "Mayotte" },
  { Dial: "+262", Flag: "🇷🇪", Code: "RE", Name: "Reunion" },
  { Dial: "+263", Flag: "🇿🇼", Code: "ZW", Name: "Zimbabwe" },
  { Dial: "+264", Flag: "🇳🇦", Code: "NA", Name: "Namibia" },
  { Dial: "+265", Flag: "🇲🇼", Code: "MW", Name: "Malawi" },
  { Dial: "+266", Flag: "🇱🇸", Code: "LS", Name: "Lesotho" },
  { Dial: "+267", Flag: "🇧🇼", Code: "BW", Name: "Botswana" },
  { Dial: "+268", Flag: "🇸🇿", Code: "SZ", Name: "Swaziland" },
  { Dial: "+269", Flag: "🇰🇲", Code: "KM", Name: "Comoros" },
  { Dial: "+27", Flag: "🇿🇦", Code: "ZA", Name: "South Africa" },
  { Dial: "+290", Flag: "🇸🇭", Code: "SH", Name: "Saint Helena, Ascension and Tristan Da Cunha" },
  { Dial: "+291", Flag: "🇪🇷", Code: "ER", Name: "Eritrea" },
  { Dial: "+297", Flag: "🇦🇼", Code: "AW", Name: "Aruba" },
  { Dial: "+298", Flag: "🇫🇴", Code: "FO", Name: "Faroe Islands" },
  { Dial: "+299", Flag: "🇬🇱", Code: "GL", Name: "Greenland" },
  { Dial: "+30", Flag: "🇬🇷", Code: "GR", Name: "Greece" },
  { Dial: "+31", Flag: "🇳🇱", Code: "NL", Name: "Netherlands" },
  { Dial: "+32", Flag: "🇧🇪", Code: "BE", Name: "Belgium" },
  { Dial: "+33", Flag: "🇫🇷", Code: "FR", Name: "France" },
  { Dial: "+34", Flag: "🇪🇸", Code: "ES", Name: "Spain" },
  { Dial: "+345", Flag: "🇰🇾", Code: "KY", Name: "Cayman Islands" },
  { Dial: "+350", Flag: "🇬🇮", Code: "GI", Name: "Gibraltar" },
  { Dial: "+351", Flag: "🇵🇹", Code: "PT", Name: "Portugal" },
  { Dial: "+352", Flag: "🇱🇺", Code: "LU", Name: "Luxembourg" },
  { Dial: "+353", Flag: "🇮🇪", Code: "IE", Name: "Ireland" },
  { Dial: "+354", Flag: "🇮🇸", Code: "IS", Name: "Iceland" },
  { Dial: "+355", Flag: "🇦🇱", Code: "AL", Name: "Albania" },
  { Dial: "+356", Flag: "🇲🇹", Code: "MT", Name: "Malta" },
  { Dial: "+357", Flag: "🇨🇾", Code: "CY", Name: "Cyprus" },
  { Dial: "+358", Flag: "🇦🇽", Code: "AX", Name: "Åland Islands" },
  { Dial: "+358", Flag: "🇫🇮", Code: "FI", Name: "Finland" },
  { Dial: "+359", Flag: "🇧🇬", Code: "BG", Name: "Bulgaria" },
  { Dial: "+36", Flag: "🇭🇺", Code: "HU", Name: "Hungary" },
  { Dial: "+370", Flag: "🇱🇹", Code: "LT", Name: "Lithuania" },
  { Dial: "+371", Flag: "🇱🇻", Code: "LV", Name: "Latvia" },
  { Dial: "+372", Flag: "🇪🇪", Code: "EE", Name: "Estonia" },
  { Dial: "+373", Flag: "🇲🇩", Code: "MD", Name: "Moldova" },
  { Dial: "+374", Flag: "🇦🇲", Code: "AM", Name: "Armenia" },
  { Dial: "+375", Flag: "🇧🇾", Code: "BY", Name: "Belarus" },
  { Dial: "+376", Flag: "🇦🇩", Code: "AD", Name: "Andorra" },
  { Dial: "+377", Flag: "🇲🇨", Code: "MC", Name: "Monaco" },
  { Dial: "+378", Flag: "🇸🇲", Code: "SM", Name: "San Marino" },
  { Dial: "+379", Flag: "🇻🇦", Code: "VA", Name: "Holy See (Vatican City State)" },
  { Dial: "+380", Flag: "🇺🇦", Code: "UA", Name: "Ukraine" },
  { Dial: "+381", Flag: "🇷🇸", Code: "RS", Name: "Serbia" },
  { Dial: "+382", Flag: "🇲🇪", Code: "ME", Name: "Montenegro" },
  { Dial: "+383", Flag: "🇽🇰", Code: "XK", Name: "Kosovo" },
  { Dial: "+385", Flag: "🇭🇷", Code: "HR", Name: "Croatia" },
  { Dial: "+386", Flag: "🇸🇮", Code: "SI", Name: "Slovenia" },
  { Dial: "+387", Flag: "🇧🇦", Code: "BA", Name: "Bosnia and Herzegovina" },
  { Dial: "+389", Flag: "🇲🇰", Code: "MK", Name: "North Macedonia" },
  { Dial: "+39", Flag: "🇮🇹", Code: "IT", Name: "Italy" },
  { Dial: "+40", Flag: "🇷🇴", Code: "RO", Name: "Romania" },
  { Dial: "+41", Flag: "🇨🇭", Code: "CH", Name: "Switzerland" },
  { Dial: "+420", Flag: "🇨🇿", Code: "CZ", Name: "Czech Republic" },
  { Dial: "+421", Flag: "🇸🇰", Code: "SK", Name: "Slovakia" },
  { Dial: "+423", Flag: "🇱🇮", Code: "LI", Name: "Liechtenstein" },
  { Dial: "+43", Flag: "🇦🇹", Code: "AT", Name: "Austria" },
  { Dial: "+44", Flag: "🇬🇬", Code: "GG", Name: "Guernsey" },
  { Dial: "+44", Flag: "🇮🇲", Code: "IM", Name: "Isle of Man" },
  { Dial: "+44", Flag: "🇯🇪", Code: "JE", Name: "Jersey" },
  { Dial: "+44", Flag: "🇬🇧", Code: "GB", Name: "United Kingdom" },
  { Dial: "+45", Flag: "🇩🇰", Code: "DK", Name: "Denmark" },
  { Dial: "+46", Flag: "🇸🇪", Code: "SE", Name: "Sweden" },
  { Dial: "+47", Flag: "🇧🇻", Code: "BV", Name: "Bouvet Island" },
  { Dial: "+47", Flag: "🇳🇴", Code: "NO", Name: "Norway" },
  { Dial: "+47", Flag: "🇸🇯", Code: "SJ", Name: "Svalbard and Jan Mayen" },
  { Dial: "+48", Flag: "🇵🇱", Code: "PL", Name: "Poland" },
  { Dial: "+49", Flag: "🇩🇪", Code: "DE", Name: "Germany" },
  { Dial: "+500", Flag: "🇫🇰", Code: "FK", Name: "Falkland Islands (Malvinas)" },
  { Dial: "+500", Flag: "🇬🇸", Code: "GS", Name: "South Georgia and the South Sandwich Islands" },
  { Dial: "+501", Flag: "🇧🇿", Code: "BZ", Name: "Belize" },
  { Dial: "+502", Flag: "🇬🇹", Code: "GT", Name: "Guatemala" },
  { Dial: "+503", Flag: "🇸🇻", Code: "SV", Name: "El Salvador" },
  { Dial: "+504", Flag: "🇭🇳", Code: "HN", Name: "Honduras" },
  { Dial: "+505", Flag: "🇳🇮", Code: "NI", Name: "Nicaragua" },
  { Dial: "+506", Flag: "🇨🇷", Code: "CR", Name: "Costa Rica" },
  { Dial: "+507", Flag: "🇵🇦", Code: "PA", Name: "Panama" },
  { Dial: "+508", Flag: "🇵🇲", Code: "PM", Name: "Saint Pierre and Miquelon" },
  { Dial: "+509", Flag: "🇭🇹", Code: "HT", Name: "Haiti" },
  { Dial: "+51", Flag: "🇵🇪", Code: "PE", Name: "Peru" },
  { Dial: "+52", Flag: "🇲🇽", Code: "MX", Name: "Mexico" },
  { Dial: "+53", Flag: "🇨🇺", Code: "CU", Name: "Cuba" },
  { Dial: "+54", Flag: "🇦🇷", Code: "AR", Name: "Argentina" },
  { Dial: "+55", Flag: "🇧🇷", Code: "BR", Name: "Brazil" },
  { Dial: "+56", Flag: "🇨🇱", Code: "CL", Name: "Chile" },
  { Dial: "+57", Flag: "🇨🇴", Code: "CO", Name: "Colombia" },
  { Dial: "+58", Flag: "🇻🇪", Code: "VE", Name: "Venezuela, Bolivarian Republic of Venezuela" },
  { Dial: "+590", Flag: "🇬🇵", Code: "GP", Name: "Guadeloupe" },
  { Dial: "+590", Flag: "🇧🇱", Code: "BL", Name: "Saint Barthelemy" },
  { Dial: "+590", Flag: "🇲🇫", Code: "MF", Name: "Saint Martin" },
  { Dial: "+591", Flag: "🇧🇴", Code: "BO", Name: "Bolivia, Plurinational State of bolivia" },
  { Dial: "+592", Flag: "🇬🇾", Code: "GY", Name: "Guyana" },
  { Dial: "+593", Flag: "🇪🇨", Code: "EC", Name: "Ecuador" },
  { Dial: "+594", Flag: "🇬🇫", Code: "GF", Name: "French Guiana" },
  { Dial: "+595", Flag: "🇵🇾", Code: "PY", Name: "Paraguay" },
  { Dial: "+596", Flag: "🇲🇶", Code: "MQ", Name: "Martinique" },
  { Dial: "+597", Flag: "🇸🇷", Code: "SR", Name: "Suriname" },
  { Dial: "+598", Flag: "🇺🇾", Code: "UY", Name: "Uruguay" },
  { Dial: "+599", Flag: "🇳🇱", Code: "AN", Name: "Netherlands Antilles" },
  { Dial: "+60", Flag: "🇲🇾", Code: "MY", Name: "Malaysia" },
  { Dial: "+61", Flag: "🇦🇺", Code: "AU", Name: "Australia" },
  { Dial: "+61", Flag: "🇨🇽", Code: "CX", Name: "Christmas Island" },
  { Dial: "+61", Flag: "🇨🇨", Code: "CC", Name: "Cocos (Keeling) Islands" },
  { Dial: "+62", Flag: "🇮🇩", Code: "ID", Name: "Indonesia" },
  { Dial: "+63", Flag: "🇵🇭", Code: "PH", Name: "Philippines" },
  { Dial: "+64", Flag: "🇳🇿", Code: "NZ", Name: "New Zealand" },
  { Dial: "+64", Flag: "🇵🇳", Code: "PN", Name: "Pitcairn" },
  { Dial: "+65", Flag: "🇸🇬", Code: "SG", Name: "Singapore" },
  { Dial: "+66", Flag: "🇹🇭", Code: "TH", Name: "Thailand" },
  { Dial: "+670", Flag: "🇹🇱", Code: "TL", Name: "Timor-Leste" },
  { Dial: "+672", Flag: "🇦🇶", Code: "AQ", Name: "Antarctica" },
  { Dial: "+672", Flag: "🇭🇲", Code: "HM", Name: "Heard Island and Mcdonald Islands" },
  { Dial: "+672", Flag: "🇳🇫", Code: "NF", Name: "Norfolk Island" },
  { Dial: "+673", Flag: "🇧🇳", Code: "BN", Name: "Brunei Darussalam" },
  { Dial: "+674", Flag: "🇳🇷", Code: "NR", Name: "Nauru" },
  { Dial: "+675", Flag: "🇵🇬", Code: "PG", Name: "Papua New Guinea" },
  { Dial: "+676", Flag: "🇹🇴", Code: "TO", Name: "Tonga" },
  { Dial: "+677", Flag: "🇸🇧", Code: "SB", Name: "Solomon Islands" },
  { Dial: "+678", Flag: "🇻🇺", Code: "VU", Name: "Vanuatu" },
  { Dial: "+679", Flag: "🇫🇯", Code: "FJ", Name: "Fiji" },
  { Dial: "+680", Flag: "🇵🇼", Code: "PW", Name: "Palau" },
  { Dial: "+681", Flag: "🇼🇫", Code: "WF", Name: "Wallis and Futuna" },
  { Dial: "+682", Flag: "🇨🇰", Code: "CK", Name: "Cook Islands" },
  { Dial: "+683", Flag: "🇳🇺", Code: "NU", Name: "Niue" },
  { Dial: "+685", Flag: "🇼🇸", Code: "WS", Name: "Samoa" },
  { Dial: "+686", Flag: "🇰🇮", Code: "KI", Name: "Kiribati" },
  { Dial: "+687", Flag: "🇳🇨", Code: "NC", Name: "New Caledonia" },
  { Dial: "+688", Flag: "🇹🇻", Code: "TV", Name: "Tuvalu" },
  { Dial: "+689", Flag: "🇵🇫", Code: "PF", Name: "French Polynesia" },
  { Dial: "+690", Flag: "🇹🇰", Code: "TK", Name: "Tokelau" },
  { Dial: "+691", Flag: "🇫🇲", Code: "FM", Name: "Micronesia, Federated States of Micronesia" },
  { Dial: "+692", Flag: "🇲🇭", Code: "MH", Name: "Marshall Islands" },
  { Dial: "+7", Flag: "🇰🇿", Code: "KZ", Name: "Kazakhstan" },
  { Dial: "+7", Flag: "🇷🇺", Code: "RU", Name: "Russia" },
  { Dial: "+81", Flag: "🇯🇵", Code: "JP", Name: "Japan" },
  { Dial: "+82", Flag: "🇰🇷", Code: "KR", Name: "Korea, Republic of South Korea" },
  { Dial: "+84", Flag: "🇻🇳", Code: "VN", Name: "Vietnam" },
  { Dial: "+850", Flag: "🇰🇵", Code: "KP", Name: "Korea, Democratic People's Republic of Korea" },
  { Dial: "+852", Flag: "🇭🇰", Code: "HK", Name: "Hong Kong" },
  { Dial: "+853", Flag: "🇲🇴", Code: "MO", Name: "Macao" },
  { Dial: "+855", Flag: "🇰🇭", Code: "KH", Name: "Cambodia" },
  { Dial: "+856", Flag: "🇱🇦", Code: "LA", Name: "Laos" },
  { Dial: "+86", Flag: "🇨🇳", Code: "CN", Name: "China" },
  { Dial: "+880", Flag: "🇧🇩", Code: "BD", Name: "Bangladesh" },
  { Dial: "+886", Flag: "🇹🇼", Code: "TW", Name: "Taiwan" },
  { Dial: "+90", Flag: "🇹🇷", Code: "TR", Name: "Türkiye" },
  { Dial: "+91", Flag: "🇮🇳", Code: "IN", Name: "India" },
  { Dial: "+92", Flag: "🇵🇰", Code: "PK", Name: "Pakistan" },
  { Dial: "+93", Flag: "🇦🇫", Code: "AF", Name: "Afghanistan" },
  { Dial: "+94", Flag: "🇱🇰", Code: "LK", Name: "Sri Lanka" },
  { Dial: "+95", Flag: "🇲🇲", Code: "MM", Name: "Myanmar" },
  { Dial: "+960", Flag: "🇲🇻", Code: "MV", Name: "Maldives" },
  { Dial: "+961", Flag: "🇱🇧", Code: "LB", Name: "Lebanon" },
  { Dial: "+962", Flag: "🇯🇴", Code: "JO", Name: "Jordan" },
  { Dial: "+963", Flag: "🇸🇾", Code: "SY", Name: "Syrian Arab Republic" },
  { Dial: "+964", Flag: "🇮🇶", Code: "IQ", Name: "Iraq" },
  { Dial: "+965", Flag: "🇰🇼", Code: "KW", Name: "Kuwait" },
  { Dial: "+966", Flag: "🇸🇦", Code: "SA", Name: "Saudi Arabia" },
  { Dial: "+967", Flag: "🇾🇪", Code: "YE", Name: "Yemen" },
  { Dial: "+968", Flag: "🇴🇲", Code: "OM", Name: "Oman" },
  { Dial: "+970", Flag: "🇵🇸", Code: "PS", Name: "Palestinian Territory, Occupied" },
  { Dial: "+971", Flag: "🇦🇪", Code: "AE", Name: "United Arab Emirates" },
  { Dial: "+972", Flag: "🇮🇱", Code: "IL", Name: "Israel" },
  { Dial: "+973", Flag: "🇧🇭", Code: "BH", Name: "Bahrain" },
  { Dial: "+974", Flag: "🇶🇦", Code: "QA", Name: "Qatar" },
  { Dial: "+975", Flag: "🇧🇹", Code: "BT", Name: "Bhutan" },
  { Dial: "+976", Flag: "🇲🇳", Code: "MN", Name: "Mongolia" },
  { Dial: "+977", Flag: "🇳🇵", Code: "NP", Name: "Nepal" },
  { Dial: "+98", Flag: "🇮🇷", Code: "IR", Name: "Iran, Islamic Republic of Persian Gulf" },
  { Dial: "+992", Flag: "🇹🇯", Code: "TJ", Name: "Tajikistan" },
  { Dial: "+993", Flag: "🇹🇲", Code: "TM", Name: "Turkmenistan" },
  { Dial: "+994", Flag: "🇦🇿", Code: "AZ", Name: "Azerbaijan" },
  { Dial: "+995", Flag: "🇬🇪", Code: "GE", Name: "Georgia" },
  { Dial: "+996", Flag: "🇰🇬", Code: "KG", Name: "Kyrgyzstan" },
  { Dial: "+998", Flag: "🇺🇿", Code: "UZ", Name: "Uzbekistan" },
]


export const countriesRequest = async (req: Request, res: Response, next: NextFunction) => {

    try{
     new CustomResponse(200, true, "successfully", res, CountriesCode);

   } catch (error) {
     next(new InternalServerError("Failed"));
   }
     
}