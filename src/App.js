import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ErrorBoundary from './components/common/ErrorBoundary';
import ApiStatusIndicator from './components/common/ApiStatusIndicator';
import Dashboard from './components/dashboard/Dashboard';
import ExpenseReportForm from './components/expenseReport/ExpenseReportForm';
import ExpenseReportList from './components/expenseReport/ExpenseReportList';
import ExpenseReportDetail from './components/expenseReport/ExpenseReportDetail';
import ApprovalQueue from './components/approvals/ApprovalQueue';
import ExpenseTemplateManagement from './components/configuration/ExpenseTemplateManagement';
import ExpenseTypeManagement from './components/configuration/ExpenseTypeManagement';
import { appConfig } from './config/app';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <Header />
          {appConfig.features.showApiStatus && <ApiStatusIndicator />}
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/expense-reports" element={<ExpenseReportList />} />
                  <Route path="/expense-reports/new" element={<ExpenseReportForm mode="create" />} />
                  <Route path="/expense-reports/:reportId" element={<ExpenseReportDetail />} />
                  <Route path="/expense-reports/:reportId/edit" element={<ExpenseReportForm mode="edit" />} />
                  <Route path="/approvals" element={<ApprovalQueue />} />
                  <Route path="/configuration/templates" element={<ExpenseTemplateManagement />} />
                  <Route path="/configuration/types" element={<ExpenseTypeManagement />} />
                </Routes>
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;