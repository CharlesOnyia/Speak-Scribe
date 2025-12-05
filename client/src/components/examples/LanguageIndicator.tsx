import { LanguageIndicator } from "../LanguageIndicator";

export default function LanguageIndicatorExample() {
  return (
    <div className="p-4 bg-card rounded-lg flex flex-col gap-4">
      <LanguageIndicator detectedLanguage="English" />
      <LanguageIndicator 
        detectedLanguage="English" 
        translatedFrom="French" 
        showTranslation={true} 
      />
    </div>
  );
}
