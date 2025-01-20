import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login';
import Register from './components/register';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/authContext';
import MultipleChoiceLayout from "./components/test"; 
import QuizPage from "./components/quiz";
import "./App.css";
import UserProfile from "./components/UserProfile.jsx";
import ChapterList from "./components/ChapterList.jsx";
import ChapterDetail from "./components/ChapterDetail.jsx";
import FullListTest from './components/FullListTest';
import ViewTest from './components/ViewTest';
import TestCreationOptions from './components/TestCreationOptions';
import ManualCreateTest from './components/ManualCreateTest';
import RandomlyCreateTest from './components/RandomlyCreateTest';
import Ranking from './components/Ranking';
import SubjectCard from './components/SubjectCard.jsx';
import QuestionBank from './components/QuestionBank.jsx';
import TestDetailsPage from './components/TestDetailsPage';
import StudentTheory from './components/studentTheory';
import ChapterListStudent from './components/ChapterListStudent';
import ResultPage from './components/ResultPage.jsx';
import SubjectMainPage from './components/SubjectMainPage';
import Exercise from './components/Exercise';
import './App.css';
import ChapterDetailStudent from './components/ChapterDetailStudent.jsx';
import StudentSubjectCard from './components/studentSubjectCard.jsx';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <Router>
      <AuthProvider>
        
        
        
        {/* Routes */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute requiredRole="Student">
                <StudentDashboard/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute requiredRole="Teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/QuestionBank"
            element={<QuestionBank/>}
          />
          <Route
            path="/SubjectCard"
            element={<SubjectCard />}
          />
          <Route path="/test" element={<QuizPage  />} />
          <Route path="/ranking" element={<Ranking toggleSidebar={toggleSidebar} />} />
          <Route path="/test/:testId/details" element={<TestDetailsPage />} />
          <Route path="/test/:testId" element={<MultipleChoiceLayout />}/>
          <Route path="/user_profile" element={<UserProfile />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/results/:testId" element={<ResultPage />} />
          <Route path='/theory' element={<StudentTheory/>}/>
          <Route path="/subjectpage" element={<SubjectMainPage />} />
          <Route path="/subject" element={<StudentSubjectCard />} />
          <Route path="/exercise/:subjectId" component={Exercise} />
          <Route
            path="/subject/:subjectId"
            element={
              localStorage.getItem("user") &&
              JSON.parse(localStorage.getItem("user")).role === "Teacher" ? (
                <ChapterList />
              ) : (
                <ChapterListStudent />
              )
            }
          />
          
          <Route
            path="/FullListTest"
            element={<FullListTest/>}
          />
          <Route
            path="/ViewTest/:testId"
            element={<ViewTest/>}
          />

          <Route
          path="/TestCreationOptions"
          element={<TestCreationOptions />} 
          />

          <Route
            path="/test/:testId"
            element={<MultipleChoiceLayout />}
          />
          <Route 
          path="/ManualCreateTest" 
          element={<ManualCreateTest />} 
          />

          <Route 
          path="/RandomlyCreateTest" 
          element={<RandomlyCreateTest />} 
          />    
          <Route
            path="/chapter/:chapterId"
            element={
              localStorage.getItem("user") &&
              JSON.parse(localStorage.getItem("user")).role === "Teacher" ? (
                <ChapterDetail />
              ) : (
                <ChapterDetailStudent />
              )
            }
          />
          <Route
            path="/subject/:subjectId"
            element={
              localStorage.getItem("user") &&
              JSON.parse(localStorage.getItem("user")).role === "Teacher" ? (
                <ChapterList />
              ) : (
                <ChapterListStudent />
              )
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
