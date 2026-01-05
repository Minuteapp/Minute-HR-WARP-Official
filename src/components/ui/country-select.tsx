import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const COUNTRIES = [
  "Deutsch", "Österreichisch", "Schweizerisch", "Italienisch", "Französisch",
  "Spanisch", "Portugiesisch", "Niederländisch", "Belgisch", "Luxemburgisch",
  "Britisch", "Irisch", "Polnisch", "Tschechisch", "Slowakisch", "Ungarisch",
  "Slowenisch", "Kroatisch", "Serbisch", "Bosnisch", "Montenegrinisch",
  "Bulgarisch", "Rumänisch", "Griechisch", "Türkisch", "Russisch",
  "Ukrainisch", "Amerikanisch", "Kanadisch", "Brasilianisch", "Argentinisch",
  "Chinesisch", "Japanisch", "Koreanisch", "Indisch", "Thailändisch",
  "Vietnamesisch", "Australisch", "Südafrikanisch", "Ägyptisch", "Marokkanisch",
  // Erweiterte Liste aller Länder
  "Afghanisch", "Albanisch", "Algerisch", "Andorranisch", "Angolanisch", "Antiguanisch",
  "Äquatorialguineisch", "Armenisch", "Aserbaidschanisch", "Äthiopisch", "Bahamaisch", "Bahranisch",
  "Bangladeschisch", "Barbadisch", "Belarussisch", "Belizisch", "Beninisch", "Bhutanesisch",
  "Bolivianisch", "Botswanisch", "Bruneiisch", "Burkinisch", "Burundisch", "Chilenisch",
  "Cookisch", "Costa-ricanisch", "Dominikanisch", "Dschibutisch", "Ecuadorianisch", "Eritreisch",
  "Estnisch", "Fidschianisch", "Finnisch", "Gabunisch", "Gambisch", "Georgisch",
  "Ghanaisch", "Grenadisch", "Guatemaltekisch", "Guineisch", "Guyana-Guyanisch", "Haitianisch",
  "Honduranisch", "Indonesisch", "Irakisch", "Iranisch", "Isländisch", "Israelisch",
  "Jamaikanisch", "Jemenitisch", "Jordanisch", "Kambodschanisch", "Kamerunisch", "Kapverdisch",
  "Kasachisch", "Katarisch", "Kenianisch", "Kirgisisch", "Kiribatisch", "Kolumbianisch",
  "Komorisch", "Kongolesisch", "Kosovarisch", "Kubanisch", "Kuwaitisch", "Laotisch",
  "Lesothisch", "Lettisch", "Libanesisch", "Liberianisch", "Libysch", "Liechtensteinisch",
  "Litauisch", "Madagassisch", "Malawisch", "Malaysisch", "Maledivisch", "Malisch",
  "Maltesisch", "Marshallisch", "Mauretanisch", "Mauritisch", "Mexikanisch", "Mikronesisch",
  "Moldauisch", "Monegassisch", "Mongolisch", "Mosambikanisch", "Myanmarisch", "Namibisch",
  "Nauruanisch", "Nepalisch", "Neuseeländisch", "Nicaraguanisch", "Nigerianisch", "Nigrisch",
  "Nordkoreanisch", "Nordmazedonisch", "Norwegisch", "Omanisch", "Pakistanisch", "Palauisch",
  "Palästinensisch", "Panamaisch", "Papua-neuguineisch", "Paraguayisch", "Peruanisch", "Philippinisch",
  "Ruandisch", "Salomonisch", "Sambisch", "Samoanisch", "San-marinesisch", "São-toméisch",
  "Saudi-arabisch", "Schottisch", "Schwedisch", "Senegalesisch", "Seychellisch", "Sierra-leonisch",
  "Simbabwisch", "Singapurisch", "Slowakisch", "Somalisch", "Sri-lankisch", "Saint-lucianisch",
  "Sudanesisch", "Südkoreanisch", "Südsudan-Südsudanesisch", "Surinamisch", "Syrisch", "Tadschikisch",
  "Tansanisch", "Togolisch", "Tongaisch", "Trinidadisch", "Tschadisch", "Tunesisch",
  "Turkmenisch", "Tuvaluisch", "Ugandisch", "Uruguayisch", "Usbekisch", "Vanuatuisch",
  "Vatikanisch", "Venezolanisch", "Vereinigte-arabische-emiratisch", "Walisisch", "Weißrussisch",
  "Zentralafrikanisch", "Zypriotisch"
];

export function CountrySelect({ value, onValueChange, disabled, placeholder = "Nationalität auswählen" }: CountrySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="h-8 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {COUNTRIES.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}