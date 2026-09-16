import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./app/Layout";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { KanjiLessonsPage } from "./features/kanji/KanjiLessonsPage";
import { KanjiTestPage } from "./features/kanji/KanjiTestPage";
import { VocabularyLessonsPage } from "./features/vocabulary/VocabularyLessonsPage";
import { VocabularyTestPage } from "./features/vocabulary/VocabularyTestPage";
import { GrammarPage } from "./features/grammar/GrammarPage";
import { ConjugationPage } from "./features/grammar/ConjugationPage";
import { NumbersPage } from "./features/numbers/NumbersPage";
import { LessonReviewPage } from "./features/lessons/LessonReviewPage";
import { LessonDetailPage } from "./features/lessons/LessonDetailPage";
import { KanaPage } from "./features/kana/KanaPage";
import { MixedReviewPage } from "./features/review/MixedReviewPage";
import { WeakAreasPage } from "./features/review/WeakAreasPage";
import { ProgressStatsPage } from "./features/progress/ProgressStatsPage";
import { SettingsPage } from "./features/settings/SettingsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="kanji" element={<KanjiLessonsPage />} />
          <Route path="kanji/test" element={<KanjiTestPage />} />
          <Route path="vocabulary" element={<VocabularyLessonsPage />} />
          <Route path="vocabulary/test" element={<VocabularyTestPage />} />
          <Route path="grammar" element={<GrammarPage />} />
          <Route path="conjugation" element={<ConjugationPage />} />
          <Route path="numbers" element={<NumbersPage />} />
          <Route path="lessons" element={<LessonReviewPage />} />
          <Route path="lessons/:lessonId" element={<LessonDetailPage />} />
          <Route path="kana" element={<KanaPage />} />
          <Route path="review/mixed" element={<MixedReviewPage />} />
          <Route path="review/weak-areas" element={<WeakAreasPage />} />
          <Route path="progress" element={<ProgressStatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
