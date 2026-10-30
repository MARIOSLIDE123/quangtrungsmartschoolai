import React, { useState, useEffect } from 'react';
import { Sidebar, NavScreenId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/screens/DashboardOverview';
import { TaskManager } from './components/screens/TaskManager';
import { CalendarSchedule } from './components/screens/CalendarSchedule';
import { AiAssistant } from './components/screens/AiAssistant';
import { PlanManager } from './components/screens/PlanManager';
import { ReportCenter } from './components/screens/ReportCenter';
import { EvidenceVault } from './components/screens/EvidenceVault';
import { ThreeCampuses } from './components/screens/ThreeCampuses';
import { SystemSettings } from './components/screens/SystemSettings';
import { StaffManager } from './components/screens/StaffManager';
import { TaskModal } from './components/modals/TaskModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { DemoWalkthroughModal } from './components/modals/DemoWalkthroughModal';
import { StaffDetailModal } from './components/modals/StaffDetailModal';
import { CampusId, CurrentUser, Task, Staff } from './types';
import { dataService } from './services/dataService';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<NavScreenId>('overview');
  const [selectedCampus, setSelectedCampus] = useState<CampusId>('all');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => dataService.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [dataVersion, setDataVersion] = useState(0);

  // Listen to remote Google Sheets sync events to update state instantly
  useEffect(() => {
    const handleRemoteSync = () => {
      setDataVersion((v) => v + 1);
    };
    window.addEventListener('qt-data-synced', handleRemoteSync);
    return () => window.removeEventListener('qt-data-synced', handleRemoteSync);
  }, []);

  // Modals state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<Staff | null>(null);
  const [aiTaskContext, setAiTaskContext] = useState<Task | null>(null);
  const [isDemoScriptOpen, setIsDemoScriptOpen] = useState(false);

  // Re-fetch metrics whenever dataVersion changes
  const metrics = dataService.getMetrics(selectedCampus);
  const alertsCount = metrics.overdue + metrics.pendingReview;

  const handleSelectScreen = (screen: NavScreenId) => {
    setActiveScreen(screen);
  };

  const handleSelectCampus = (campusId: CampusId) => {
    setSelectedCampus(campusId);
  };

  const handleChangeUser = (newUser: CurrentUser) => {
    setCurrentUser(newUser);
    dataService.setCurrentUser(newUser);
    setDataVersion((v) => v + 1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (q.trim() && activeScreen !== 'tasks') {
      setActiveScreen('tasks');
    }
  };

  const handleSaveNewTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    dataService.createTask(taskData, currentUser);
    setDataVersion((v) => v + 1);
  };

  const handleUpdateTask = (updated: Task) => {
    setSelectedTaskForDetail(updated);
    setDataVersion((v) => v + 1);
  };

  const handleOpenAiWithTask = (task: Task) => {
    setAiTaskContext(task);
    setActiveScreen('ai-assistant');
  };

  const handleOpenStaffByName = (staffName: string) => {
    const list = dataService.getStaffList();
    const found = list.find((s) => s.fullName === staffName);
    if (found) {
      setSelectedStaffForModal(found);
    } else {
      setActiveScreen('staff');
    }
  };

  const handleDataReset = () => {
    setDataVersion((v) => v + 1);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7FB] text-[#142B4A] font-sans antialiased">
      {/* Fixed Left Navigation Sidebar (240px) */}
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={handleSelectScreen}
        pendingAlertsCount={alertsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          activeScreen={activeScreen}
          selectedCampus={selectedCampus}
          onSelectCampus={handleSelectCampus}
          currentUser={currentUser}
          onChangeUser={handleChangeUser}
          onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
          onOpenDemoScriptModal={() => setIsDemoScriptOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          alertsCount={alertsCount}
          onViewAlerts={() => {
            setActiveScreen('tasks');
          }}
        />

        {/* Viewport Content View */}
        <main className="flex-1 overflow-hidden relative">
          {activeScreen === 'overview' && (
            <DashboardOverview
              key={`overview-${dataVersion}`}
              selectedCampus={selectedCampus}
              onSelectCampus={handleSelectCampus}
              onNavigateScreen={handleSelectScreen}
              onSelectTask={(task) => setSelectedTaskForDetail(task)}
              currentUser={currentUser}
            />
          )}

          {activeScreen === 'staff' && (
            <StaffManager
              key={`staff-${dataVersion}`}
              currentUser={currentUser}
              onOpenTaskDetail={(task) => setSelectedTaskForDetail(task)}
            />
          )}

          {activeScreen === 'tasks' && (
            <TaskManager
              key={`tasks-${dataVersion}`}
              selectedCampus={selectedCampus}
              onSelectCampus={handleSelectCampus}
              onSelectTask={(task) => setSelectedTaskForDetail(task)}
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
              currentUser={currentUser}
            />
          )}

          {activeScreen === 'calendar' && (
            <CalendarSchedule
              key={`calendar-${dataVersion}`}
              selectedCampus={selectedCampus}
              onSelectCampus={handleSelectCampus}
              currentUser={currentUser}
            />
          )}

          {activeScreen === 'ai-assistant' && (
            <AiAssistant
              key={`ai-${dataVersion}-${aiTaskContext?.id || 'none'}`}
              selectedCampus={selectedCampus}
              currentUser={currentUser}
              initialTaskContext={aiTaskContext}
              onClearInitialTaskContext={() => setAiTaskContext(null)}
            />
          )}

          {activeScreen === 'plans' && (
            <PlanManager
              key={`plans-${dataVersion}`}
              selectedCampus={selectedCampus}
              currentUser={currentUser}
              onNavigateScreen={handleSelectScreen}
            />
          )}

          {activeScreen === 'reports' && (
            <ReportCenter
              key={`reports-${dataVersion}`}
              selectedCampus={selectedCampus}
              currentUser={currentUser}
            />
          )}

          {activeScreen === 'evidence' && (
            <EvidenceVault
              key={`evidence-${dataVersion}`}
              selectedCampus={selectedCampus}
              currentUser={currentUser}
            />
          )}

          {activeScreen === 'campuses' && (
            <ThreeCampuses
              key={`campuses-${dataVersion}`}
              selectedCampus={selectedCampus}
              onSelectCampus={handleSelectCampus}
              onNavigateScreen={handleSelectScreen}
              onSelectTask={(task) => setSelectedTaskForDetail(task)}
            />
          )}

          {activeScreen === 'settings' && (
            <SystemSettings
              key={`settings-${dataVersion}`}
              currentUser={currentUser}
              onChangeUser={handleChangeUser}
              onDataReset={handleDataReset}
            />
          )}
        </main>
      </div>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        onSaveTask={handleSaveNewTask}
        currentUser={currentUser}
      />

      {/* Task Detail & Approval Modal */}
      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={!!selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        currentUser={currentUser}
        onUpdateTask={handleUpdateTask}
        onOpenUploadEvidence={() => {
          setSelectedTaskForDetail(null);
          setActiveScreen('evidence');
        }}
        onOpenAiAssistantWithTask={handleOpenAiWithTask}
        onOpenStaffProfile={handleOpenStaffByName}
      />

      {/* Staff Detail Modal when invoked from Task */}
      {selectedStaffForModal && (
        <StaffDetailModal
          staff={selectedStaffForModal}
          isOpen={!!selectedStaffForModal}
          onClose={() => setSelectedStaffForModal(null)}
          currentUser={currentUser}
          onUpdateStaff={(updated) => setSelectedStaffForModal(updated)}
          onOpenTaskDetail={(task) => {
            setSelectedStaffForModal(null);
            setSelectedTaskForDetail(task);
          }}
        />
      )}

      {/* Demo 8-Step Walkthrough Modal for Judging Panel */}
      <DemoWalkthroughModal
        isOpen={isDemoScriptOpen}
        onClose={() => setIsDemoScriptOpen(false)}
        onNavigateScreen={handleSelectScreen}
        onSelectTask={(task) => setSelectedTaskForDetail(task)}
        onOpenAiWithTask={handleOpenAiWithTask}
      />
    </div>
  );
}
