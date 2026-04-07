import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import QueryPage from "@/pages/QueryPage";
import ResultPage from "@/pages/ResultPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/query" replace />} />
        <Route path="/query" element={<QueryPage />} />
        <Route path="/result/:id" element={<ResultPage />} />
      </Routes>
    </Router>
  );
}
