import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import EmployeeManagement from "./pages/EmployeeManagement";
import TermsConditions from "./pages/Legal/TermsConditions";
import PrivacyPolicy from "./pages/Legal/PrivacyPolicy";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import ClientList from "./pages/Clients/ClientList";
import ClientForm from "./pages/Clients/ClientForm";
import ClientDetail from "./pages/Clients/ClientDetail";
import RepairList from "./pages/Repairs/RepairList";
import RepairForm from "./pages/Repairs/RepairForm";
import RepairDetail from "./pages/Repairs/RepairDetail";
import Statistics from "./pages/Stats/Statistics";
import StockList from "./pages/Stock/StockList";
import SupplierOrders from "./pages/Orders/SupplierOrders";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Root Redirect */}
          <Route path="/" element={<Navigate to="/signup" replace />} />

          {/* Dashboard Layout - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Client Routes */}
              <Route path="/clients" element={<ClientList />} />
              <Route path="/clients/new" element={<ClientForm />} />
              <Route path="/clients/edit/:id" element={<ClientForm />} />
              <Route path="/clients/:id_client" element={<ClientDetail />} />

              {/* Repair Routes */}
              <Route path="/reparations" element={<RepairList />} />
              <Route path="/reparations/new" element={<RepairForm />} />
              <Route path="/reparations/edit/:id" element={<RepairForm />} />
              <Route path="/reparations/:id" element={<RepairDetail />} />

              {/* Stats Routes */}
              <Route path="/stats" element={<Statistics />} />

              {/* Stock Routes */}
              <Route path="/stock" element={<StockList />} />

              {/* Order Routes */}
              <Route path="/orders" element={<SupplierOrders />} />

              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/employees" element={<EmployeeManagement />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          {/* Auth Layout - Public */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Legal Pages - Public */}
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
