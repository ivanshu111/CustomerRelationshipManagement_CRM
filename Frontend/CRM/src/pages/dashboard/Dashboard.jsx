import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { 
  getAllApplicants, 
  getApplicantById, 
  getApplicantEvaluation,
  acceptApplicant,
  rejectApplicant
} from "../../api/recruitmentApi";
import {
  getCustomerCount,
  getLeadsCount,
  getClosedLeadsCount,
  getConversionRate,
  getBestEmployee,
  getAllEmployees,
  getAllCustomers,
  getResignationRequests,
  getBlockedEmployees,
  getDeletedEmployees,
  getPendingAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  blockEmployee,
  unblockEmployee,
  softDeleteEmployee,
  approveResignation,
  rejectResignation,
  restoreEmployee
} from "../../api/adminApi";
import {
  getMyCustomers,
  getInterestedCustomers,
  getNotInterestedCustomers,
  requestUnblock,
  getEmployeeConversionRate
} from "../../api/employeeApi";

import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notificatonApi";

import Modal from "../../components/Modal";
import { RegisterForm } from "../auth/RegisterForm";
import { getProfile } from "../../api/authApi";
import { toast } from "react-hot-toast";
import { AddCustomerForm } from "../../pages/customers/AddCustomerForm";
import { EmployeeDetails } from "../admin/EmployeeDetails";
//import { ApplicantDetails } from "../admin/ApplicantDetails"
import { CustomerDetails } from "../customers/CustomerDetails";
import { InteractionHistory } from "../interactions/InteractionHistory";
import { ResignationForm } from "./ResignationForm";
import { ChangePasswordForm } from "./ChangePasswordForm";


export const Dashboard = () => {
  const { user, login, logout, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [myCustomers, setMyCustomers] = useState([]);
  const [interestedCustomers, setInterestedCustomers] = useState([]);
  const [notInterestedCustomers, setNotInterestedCustomers] = useState([]);
  const [leadBreakdown, setLeadBreakdown] = useState([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // New employee status management states
  const [resignationRequests, setResignationRequests] = useState([]);
  const [blockedEmployees, setBlockedEmployees] = useState([]);
  const [deletedEmployees, setDeletedEmployees] = useState([]);
  const [pendingAccessRequests, setPendingAccessRequests] = useState([]);
  const [employeeSubTab, setEmployeeSubTab] = useState("directory");
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  // Block removal form states
  const [unblockReason, setUnblockReason] = useState("");
  const [isSubmittingUnblock, setIsSubmittingUnblock] = useState(false);

  const pendingBlockRemovals = blockedEmployees.filter((emp) => emp.blockRemovalRequested);

  // Customer pagination and search states
  const [customerPage, setCustomerPage] = useState(0);
  const [customerTotalPages, setCustomerTotalPages] = useState(0);
  const [customerSearch, setCustomerSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");


  const [employeeConversionRate, setEmployeeConversionRate] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState("");
  const [selectedApplicantId, setSelectedApplicantId] = useState(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);
 
  const [stats, setStats] = useState({
    customers: 0,
    leads: 0,
    closedLeads: 0,
    conversionRate: 0,
    bestEmployee: {
    id: null,
    name: "N/A",
    conversionRate: 0,
  },
  });

  const navigate = useNavigate();

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const fetchCustomersData = (page = customerPage, search = customerSearch) => {
    if (user && user.role === "ADMIN") {
      getAllCustomers({
        page: page,
        size: 10,
        search: search || undefined
      })
        .then((res) => {
          setCustomers(res.data.content || []);
          setCustomerTotalPages(res.data.totalPages || 0);
        })
        .catch((err) => console.error("Error fetching customers:", err));
    }
  };
    
  const fetchApplicants = async () => {
    try {
      setApplicantsLoading(true);
      setApplicantsError("");

      const response = await getAllApplicants();

      setApplicants(response.data);
    } catch (error) {
      console.error("Failed to fetch applicants:", error);

      setApplicantsError(
        error.response?.data?.message ||
        "Failed to load applicants."
      );
    } finally {
      setApplicantsLoading(false);
    }
  };

   useEffect(() => {
  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await getUnreadNotificationCount();

      setUnreadCount(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch unread notification count:",
        error
      );
    }
  };

  fetchUnreadCount();
}, [user]);

        
    useEffect(() => {
    const fetchNotifications = async () => {
        if (!user) return;

        try {
        const response = await getMyNotifications();

        setNotifications(response.data);
        } catch (error) {
        console.error(
            "Failed to fetch notifications:",
            error
        );
        }
    };
    fetchNotifications();
    }, [user]);

    useEffect(() => {
    const handleNewNotification = (event) => {
        const newNotification = event.detail;

        console.log(
        "New notification received in Dashboard:",
        newNotification
        );

        // Add new notification to the top
        setNotifications((prevNotifications) => [
        newNotification,
        ...prevNotifications,
        ]);

        // Increase unread count
        setUnreadCount((prevCount) => prevCount + 1);
    };

    window.addEventListener(
        "new-notification",
        handleNewNotification
    );

    return () => {
        window.removeEventListener(
        "new-notification",
        handleNewNotification
        );
    };
    }, []);

    useEffect(() => {
    if (activeTab === "customers") {
      fetchCustomersData(customerPage, customerSearch);
    }
  }, [customerPage, customerSearch, activeTab]);

    const fetchData = () => {
    if (user) {
      console.log("fetchData called");
      console.log("Current user:", user);
      if (user.role === "ADMIN") {
        // Fetch Admin stats
        console.log("Admin fetchData running");
        Promise.all([
          getCustomerCount(),
          getLeadsCount(),
          getClosedLeadsCount(),
          getConversionRate(),
          getBestEmployee(),
          getAllCustomers({ page: 0, size: 10000 }),
        ])
          .then(([cust, leads, closed, conv, best, allCust]) => {
            console.log("Fresh customers from API:", allCust.data.content);
            setStats({
              customers: cust.data,
              leads: leads.data,
              closedLeads: closed.data,
              conversionRate: conv.data,
              bestEmployee: best.data,
            });

            console.log("best employee : ",best.data);


            const content = allCust.data.content || [];
            setCustomers(content);

            // Calculate breakdown from existing customer list
            const counts = content.reduce((acc, curr) => {
              const status = curr.status || "NEW";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {});

            setLeadBreakdown(
              Object.keys(counts).map((status) => ({
                name: status,
                value: counts[status],
              })),
            );
          })
          .catch((err) => console.error("Error fetching admin stats:", err));

        // Fetch employees lists
        getAllEmployees()
          .then((res) => setEmployees(res.data))
          .catch((err) => console.error(err));

        getResignationRequests()
          .then((res) => setResignationRequests(res.data))
          .catch((err) => console.error(err));

        getBlockedEmployees()
          .then((res) => setBlockedEmployees(res.data))
          .catch((err) => console.error(err));

        getDeletedEmployees()
          .then((res) => setDeletedEmployees(res.data))
          .catch((err) => console.error(err));

        getPendingAccessRequests()
          .then((res) => setPendingAccessRequests(res.data))
          .catch((err) => console.error(err));
        } else if (user.role === "EMPLOYEE") {
        // Fetch Employee data
        Promise.all([
          getMyCustomers(),
          getInterestedCustomers(),
          getNotInterestedCustomers(),
        ])
          .then(([allRes, intRes, notIntRes]) => {
            setMyCustomers(allRes.data);
            setInterestedCustomers(intRes.data);
            setNotInterestedCustomers(notIntRes.data);
            const closedCount = allRes.data.filter(
              (c) => c.status === "CLOSED",
            ).length;
            setStats((prev) => ({
              ...prev,
              customers: allRes.data.length,
              closedLeads: closedCount,
            }));
          })
          .catch((err) => console.error("Error fetching employee data:", err));

          // Fetch logged-in employee's conversion rate
          getEmployeeConversionRate(user.id)
          .then((res) => {
            setEmployeeConversionRate(res.data);
          })
          .catch((err) => {
            console.error("Error fetching employee conversion rate:", err);
          });
        }
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            Loading...
        </div>
        );
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    useEffect(() => {
  if (activeTab === "applicants") {
    fetchApplicants();
  }
  }, [activeTab]);


    const handleMarkAsRead = async (notificationId) => {
    try {
        await markNotificationAsRead(
        notificationId
        );

        setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
            notification.id === notificationId
            ? {
                ...notification,
                read: true,
                }
            : notification
        )
        );

        setUnreadCount((prevCount) =>
        Math.max(prevCount - 1, 0)
        );
    } catch (error) {
        console.error(
        "Failed to mark notification as read:",
        error
        );
    }
    };

    const handleMarkAllAsRead = async () => {
    try {
        await markAllNotificationsAsRead();

        setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
            ...notification,
            read: true,
        }))
        );

        setUnreadCount(0);
        } catch (error) {
        console.error(
            "Failed to mark all notifications as read:",
            error
        );
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleAcceptApplicant = async (applicantId) => {
        try {
        await acceptApplicant(applicantId);

        // Update the applicant status in the UI
        setApplicants((prevApplicants) =>
            prevApplicants.map((applicant) =>
            applicant.id === applicantId
                ? { ...applicant, status: "ACCEPTED" }
                : applicant
            )
        );

        } catch (error) {
        console.error("Failed to accept applicant:", error);
        alert("Failed to accept applicant");
        }
    };

    const handleRejectApplicant = async (applicantId) => {
        try {
        await rejectApplicant(applicantId);

        // Update the applicant status in the UI
        setApplicants((prevApplicants) =>
            prevApplicants.map((applicant) =>
            applicant.id === applicantId
                ? { ...applicant, status: "REJECTED" }
                : applicant
            )
        );

        } catch (error) {
        console.error("Failed to reject applicant:", error);
        alert("Failed to reject applicant");
        }
    };

    const handleRegisterSuccess = () => {
        setIsRegisterModalOpen(false);
        fetchData();
    };
    
    const handleStarEmployeeClick = () => {
    if (stats.bestEmployee.id) {
      handleEmployeeClick(stats.bestEmployee.id);
    }
    };


    
    const handleAddCustomerSuccess = () => {
        setIsAddCustomerModalOpen(false);
        fetchData();
    };

	
    const handleRequestUnblock = async (e) => {
        e.preventDefault();
        if (!unblockReason.trim()) {
        toast.error("Please enter a reason for your request");
        return;
    }
    setIsSubmittingUnblock(true);
        try {
            await requestUnblock(unblockReason);
            toast.success("Block removal request submitted successfully!");
            setUnblockReason("");
            getProfile()
                .then((response) => {
                login(response.data);
                })
                .catch((err) => console.error("Error refreshing profile:", err));
        } catch (err) {
            console.error("Failed to submit unblock request:", err);
            toast.error(err.response?.data?.message || "Failed to submit request.");
        } finally {
        setIsSubmittingUnblock(false);
        }
    };

    const handleApproveAccess = async (id) => {
        if (!window.confirm("Are you sure you want to approve this access request?")) return;
        try {
            await approveAccessRequest(id);
            toast.success("Access request approved successfully!");
            fetchData();
        } catch (err) {
            console.error("Failed to approve access:", err);
            toast.error(err.response?.data?.message || "Failed to approve access request.");
        }
    };

    const handleRejectAccess = async (id) => {
        if (!window.confirm("Are you sure you want to reject and delete this access request?")) return;
        try {
        await rejectAccessRequest(id);
        toast.success("Access request rejected.");
        fetchData();
        } catch (err) {
        console.error("Failed to reject access:", err);
        toast.error(err.response?.data?.message || "Failed to reject access request.");
        }
    };

    const handleEmployeeClick = (id) => {
        setSelectedEmployeeId(id);
        setIsDetailsModalOpen(true);
    };

    const handleCustomerClick = (id) => {
        setSelectedCustomerId(id);
        setIsCustomerModalOpen(true);
    };

    const handleHistoryClick = (e, id) => {
        e.stopPropagation();
        setSelectedCustomerId(id);
        setIsHistoryModalOpen(true);
    };

    const handleApproveResignation = async (id) => {
    if (!window.confirm("Are you sure you want to APPROVE this resignation? This employee will be inactivated and their customers reassigned to you.")) return;
    try {
      await approveResignation(id);
      toast.success("Resignation approved successfully!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve resignation.");
    }
  };

  const handleRejectResignation = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT this resignation?")) return;
    try {
      await rejectResignation(id);
      toast.success("Resignation request rejected.");
      fetchData();
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject resignation.");
    }
  };
  
  const handleUnblockEmployee = async (id) => {
      if (!window.confirm("Are you sure you want to unblock this employee? Their status will be set back to ACTIVE.")) return;
      try {
        await unblockEmployee(id);
        toast.success("Employee unblocked successfully!");
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to unblock employee.");
      }
    };
  
    const handleRestoreEmployee = async (id) => {
      if (!window.confirm("Are you sure you want to restore this employee? Their status will be set back to ACTIVE.")) return;
      try {
        await restoreEmployee(id);
        toast.success("Employee restored successfully!");
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to restore employee.");
      }
    };

    const filteredEmployees = employees.filter((emp) => {
    const term = employeeSearch.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.id && emp.id.toString().includes(term)) ||
      (emp.role && emp.role.toLowerCase().includes(term)) ||
      (emp.employeeStatus && emp.employeeStatus.toLowerCase().includes(term))
    );
  });

  const filteredResignations = resignationRequests.filter((emp) => {
    const term = employeeSearch.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.id && emp.id.toString().includes(term)) ||
      (emp.resignationReason && emp.resignationReason.toLowerCase().includes(term))
    );
  });

  const filteredBlocked = blockedEmployees.filter((emp) => {
    const term = employeeSearch.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.id && emp.id.toString().includes(term)) ||
      (emp.blockedReason && emp.blockedReason.toLowerCase().includes(term))
    );
  });

  const filteredDeleted = deletedEmployees.filter((emp) => {
    const term = employeeSearch.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.id && emp.id.toString().includes(term)) ||
      (emp.deletedByEmail && emp.deletedByEmail.toLowerCase().includes(term))
    );
  });

  const filteredAccessRequests = pendingAccessRequests.filter((emp) => {
    const term = employeeSearch.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.id && emp.id.toString().includes(term))
    );
  });



    // I : declaration Part

  console.log("Current user object in Dashboard:", user);

  return (
    <div className="min-h-screen bg-slate-50/60">
      <nav className="bg-slate-900 border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-1">
              <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-black tracking-tight shadow-md">CRM</span>
              <span className="text-sm font-bold text-white tracking-tight ml-1">Enterprise Portal</span>
              
              <div className="hidden md:flex items-center ml-8 space-x-1 border-l border-slate-800 pl-6">
                {user.role === "ADMIN" && (
                  <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="text-xs font-bold text-slate-300 hover:text-white transition-all py-1.5 px-3 rounded-lg hover:bg-slate-800/60 cursor-pointer"
                  >
                    Register Employee
                  </button>
                )}
                <button
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="text-xs font-bold text-slate-300 hover:text-white transition-all py-1.5 px-3 rounded-lg hover:bg-slate-800/60 cursor-pointer"
                >
                  Add Customer
                </button>
                {user.role === "EMPLOYEE" && user.employeeStatus === "ACTIVE" && (
                  <button
                    onClick={() => setIsResignModalOpen(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-all py-1.5 px-3 rounded-lg hover:bg-amber-950/20 cursor-pointer"
                  >
                    Request Resignation
                  </button>
                )}
                <button
                  onClick={() => setIsChangePasswordModalOpen(true)}
                  className="text-xs font-bold text-slate-300 hover:text-white transition-all py-1.5 px-3 rounded-lg hover:bg-slate-800/60 cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">

            <div className="relative">
              {/* Notification Bell */}
              <button
                onClick={() =>
                  setShowNotifications(
                    (prev) => !prev
                  )
                }
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Notifications
                      </h3>

                      {unreadCount > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {unreadCount} unread
                        </p>
                      )}
                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-96 overflow-y-auto">

                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-slate-500">
                          No notifications
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(
                                notification.id
                              );
                            }
                          }}
                          className={`px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors ${
                            notification.read
                              ? "bg-white hover:bg-slate-50"
                              : "bg-indigo-50 hover:bg-indigo-100"
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">

                            <div className="flex-1">

                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-800">
                                  {notification.title}
                                </h4>

                                {!notification.read && (
                                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 mt-1">
                                {notification.message}
                              </p>

                              {notification.createdAt && (
                                <p className="text-[10px] text-slate-400 mt-2">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              )}

                            </div>

                          </div>
                        </div>
                      ))
                    )}

                  </div>
                </div>
              )}
            </div>

              <span className="text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700/50 px-3 py-1.5 rounded-lg shadow-inner">
                {user.name}{" "}
                <span className="text-slate-500 font-normal">
                  ({user.role})
                </span>
              </span>

              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Logout
              </button>

            </div>


          </div>
        </div>
      </nav>


      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {user.role === "ADMIN" ? (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    {
                      id: "overview",
                      label: "Overview",
                      icon: (
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      ),
                    },
                    {
                      id: "employees",
                      label: "Employees",
                      icon: (
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      ),
                    },
                    {
                      id: "customers",
                      label: "Customers",
                      icon: (
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      ),
                    },
                    {
                      id: "applicants",
                      label: "Applicants",
                      icon: (
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      ),
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        py-3 px-1 border-b-2 font-bold text-xs tracking-wider uppercase
                        flex items-center transition-all cursor-pointer
                        ${
                          activeTab === tab.id
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                        }
                      `}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>



              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {pendingBlockRemovals.length > 0 && (
                    <div className="bg-white border-l-4 border-amber-500 border border-y-slate-200/60 border-r-slate-200/60 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="h-9 w-9 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">Block Removal Requests Pending Review</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">The following blocked employees have requested account reactivation:</p>
                          <div className="mt-3 space-y-2">
                            {pendingBlockRemovals.map(emp => (
                              <div key={emp.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-lg hover:bg-slate-100/50 transition-all">
                                <div className="text-xs">
                                  <span className="font-bold text-slate-700">{emp.name}</span>
                                  <span className="text-slate-300 mx-2">|</span>
                                  <span className="text-slate-500 font-medium italic">"{emp.blockRemovalReason}"</span>
                                </div>
                                <button
                                  onClick={() => handleEmployeeClick(emp.id)}
                                  className="text-[10px] bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                                >
                                  Review Request
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {pendingAccessRequests.length > 0 && (
                    <div className="bg-white border-l-4 border-emerald-500 border border-y-slate-200/60 border-r-slate-200/60 rounded-xl p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="h-9 w-9 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-800">New Employee Access Requests</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">The following users have requested access to the CRM system:</p>
                          <div className="mt-3 space-y-2">
                            {pendingAccessRequests.map(req => (
                              <div key={req.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-lg hover:bg-slate-100/50 transition-all">
                                <div className="text-xs">
                                  <span className="font-bold text-slate-700">{req.name}</span>
                                  <span className="text-slate-300 mx-2">|</span>
                                  <span className="text-slate-500 font-medium">{req.email}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveAccess(req.id)}
                                    className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectAccess(req.id)}
                                    className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Total Customers Card */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/60 relative group transition-all hover:shadow-md">
                      <div className="px-5 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customers</dt>
                          <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        </div>
                        <dd className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{stats.customers}</dd>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                          
                        </p>
                      </div>
                    </div>

                    {/* Total Leads Card */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/60 relative group transition-all hover:shadow-md">
                      <div className="px-5 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Leads</dt>
                          <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        </div>
                        <dd className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{stats.leads}</dd>
                        <p className="text-[10px] text-indigo-600 font-semibold mt-2 flex items-center gap-1">
                          <span>Active pipeline</span>
                        </p>
                      </div>
                    </div>

                    {/* Closed Leads Card */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200/60 relative group transition-all hover:shadow-md">
                      <div className="px-5 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                          <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Won Deals</dt>
                          <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <dd className="mt-1 text-2xl font-extrabold text-slate-900 tracking-tight">{stats.closedLeads}</dd>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                          <span>Won accounts</span>
                        </p>
                      </div>
                    </div>
                  </div>


                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Conversion Chart Card */}
                    <div className="bg-slate-50 shadow-md rounded-xl p-6 border border-slate-200/50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Lead Conversion Analysis
                        </h3>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Overall Conversion Rate
                          </p>
                          <p className="text-2xl font-bold text-indigo-600">
                            {stats.conversionRate.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={leadBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {leadBreakdown.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Performance Summary Card */}
                    <div className="bg-slate-50 shadow-md rounded-xl p-6 border border-slate-200/50">
                      <div className="flex items-center space-x-2 mb-4">
                        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">Top Performance</h3>
                      </div>
                      <div
                        onClick={handleStarEmployeeClick}
                        className="flex items-center space-x-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-4 cursor-pointer hover:bg-indigo-100 transition-colors"
                        title="Click to view details"
                      >
                        <div className="bg-indigo-600 p-3 rounded-full">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wider">
                            Star Employee
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.bestEmployee.name}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                            Success Metric
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{ width: `${stats.bestEmployee.conversionRate}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Target reached: {stats.bestEmployee.conversionRate.toFixed(2)}%
                            of closed deals.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* New Quick Access Cards */}
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {/* Top Employees Card */}
                    <div className="bg-slate-50 shadow-lg rounded-2xl overflow-hidden border border-slate-200/60">
                      <div className="px-6 py-4 bg-indigo-50/30 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-md font-bold text-indigo-900">Key Personnel</h3>
                        <button 
                          onClick={() => setActiveTab('employees')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {employees.slice(0, 5).map((emp) => (
                          <div 
                            key={emp.id} 
                            onClick={() => handleEmployeeClick(emp.id)}
                            className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:scale-110 transition-transform">
                                {emp.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-bold text-gray-800">{emp.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{emp.role}</p>
                              </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Customers Card */}
                    <div className="bg-slate-50 shadow-lg rounded-2xl overflow-hidden border border-slate-200/60">
                      <div className="px-6 py-4 bg-emerald-50/30 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-md font-bold text-emerald-900">Priority Customers</h3>
                        <button 
                          onClick={() => setActiveTab('customers')}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                        >
                          View All
                        </button>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {customers.slice(0, 5).map((cust) => (
                          <div 
                            key={cust.id} 
                            onClick={() => handleCustomerClick(cust.id)}
                            className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-sm group-hover:rotate-12 transition-transform">
                                {cust.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-bold text-gray-800">{cust.name}</p>
                                <div className="flex items-center">
                                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${cust.status === 'CLOSED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                  <p className="text-[10px] text-gray-500 font-medium">{cust.status}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-mono">#{cust.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}


              {activeTab === "employees" && (
                <div className="bg-slate-50 shadow-xl rounded-2xl overflow-hidden border border-slate-200/60">
                  <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Employee Management</h3>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Track status, manage resignations, blockings, and archiving.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto items-start sm:items-center">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "directory", label: "Directory", count: employees.length },
                          { id: "resignations", label: "Resignations", count: resignationRequests.length, badgeColor: "bg-amber-100 text-amber-800" },
                          { id: "blocked", label: "Blocked", count: blockedEmployees.length, badgeColor: "bg-red-100 text-red-800" },
                          { id: "deleted", label: "Archived (Soft Deleted)", count: deletedEmployees.length, badgeColor: "bg-rose-100 text-rose-800" },
                        ].map((subTab) => (
                          <button
                            key={subTab.id}
                            onClick={() => setEmployeeSubTab(subTab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer ${
                              employeeSubTab === subTab.id
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            {subTab.label}
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                              employeeSubTab === subTab.id ? "bg-white/20 text-white" : subTab.badgeColor || "bg-gray-100 text-gray-600"
                            }`}>
                              {subTab.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="relative w-full sm:w-64">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Search employees..." 
                          value={employeeSearch}
                          onChange={(e) => setEmployeeSearch(e.target.value)}
                          className="block w-full pl-9 pr-8 py-1.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs transition-all shadow-sm"
                        />
                        {employeeSearch && (
                          <button 
                            onClick={() => setEmployeeSearch("")}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {employeeSubTab === "directory" && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredEmployees.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                {employeeSearch ? "No employees match your search." : "No employees found."}
                              </td>
                            </tr>
                          ) : (
                            filteredEmployees.map((emp) => (
                              <tr
                                key={emp.id}
                                onClick={() => handleEmployeeClick(emp.id)}
                                className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {emp.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900">{emp.name}</div>
                                      <div className="text-xs text-gray-500 font-medium">Emp ID: #{emp.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{emp.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${emp.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                    {emp.role}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-full border ${
                                    emp.employeeStatus === 'ACTIVE' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : emp.employeeStatus === 'PENDING_RESIGNATION'
                                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                      : emp.employeeStatus === 'BLOCKED'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-gray-50 text-gray-700 border-gray-200'
                                  }`}>
                                    {emp.employeeStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold">View Details</button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {employeeSubTab === "resignations" && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Working Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Requested At</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredResignations.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                {employeeSearch ? "No resignation requests match your search." : "No pending resignation requests."}
                              </td>
                            </tr>
                          ) : (
                            filteredResignations.map((emp) => (
                              <tr
                                key={emp.id}
                                onClick={() => handleEmployeeClick(emp.id)}
                                className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border-2 border-white shadow-sm">
                                        {emp.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900">{emp.name}</div>
                                      <div className="text-xs text-gray-500 font-medium">Emp ID: #{emp.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-600 font-medium">
                                  {emp.resignationReason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                                  {emp.lastWorkingDate ? new Date(emp.lastWorkingDate).toLocaleDateString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                                  {emp.resignationRequestedAt ? new Date(emp.resignationRequestedAt).toLocaleString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApproveResignation(emp.id);
                                    }}
                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold"
                                  >
                                    Approve
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRejectResignation(emp.id);
                                    }}
                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold ml-2"
                                  >
                                    Reject
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {employeeSubTab === "blocked" && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Block Reason</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Blocked At</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Blocked Until</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredBlocked.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                {employeeSearch ? "No blocked employees match your search." : "No blocked employees."}
                              </td>
                            </tr>
                          ) : (
                            filteredBlocked.map((emp) => (
                              <tr
                                key={emp.id}
                                onClick={() => handleEmployeeClick(emp.id)}
                                className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold border-2 border-white shadow-sm">
                                        {emp.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                                        {emp.name}
                                        {emp.blockRemovalRequested && (
                                          <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200 animate-pulse">REMOVAL REQUESTED</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500 font-medium">Emp ID: #{emp.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-600 font-medium">
                                  {emp.blockedReason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                                  {emp.blockedAt ? new Date(emp.blockedAt).toLocaleString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                  {emp.blockedUntil ? new Date(emp.blockedUntil).toLocaleString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnblockEmployee(emp.id);
                                    }}
                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold"
                                  >
                                    Unblock
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {employeeSubTab === "deleted" && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Deleted At</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Deleted By</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {filteredDeleted.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 italic">
                                {employeeSearch ? "No archived employees match your search." : "No archived employees."}
                              </td>
                            </tr>
                          ) : (
                            filteredDeleted.map((emp) => (
                              <tr
                                key={emp.id}
                                onClick={() => handleEmployeeClick(emp.id)}
                                className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold border-2 border-white shadow-sm">
                                        {emp.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900">{emp.name}</div>
                                      <div className="text-xs text-gray-500 font-medium">Emp ID: #{emp.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{emp.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                  {emp.deletedAt ? new Date(emp.deletedAt).toLocaleString() : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                  {emp.deletedByEmail || "System Admin"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRestoreEmployee(emp.id);
                                    }}
                                    className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-lg transition-colors cursor-pointer font-semibold"
                                  >
                                    Restore
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "customers" && (
                <div className="bg-slate-50 shadow-xl rounded-2xl overflow-hidden border border-slate-200/60">
                  <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Global Customer Base</h3>
                    <div className="flex space-x-3">
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Search customers..." 
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setCustomerPage(0);
                          }}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Customer Info
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Contact Details
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Assigned Agent
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Pipeline Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {customers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 italic">No customers found.</td>
                          </tr>
                        ) : (
                          customers.map((cust) => (
                            <tr
                              key={cust.id}
                              onClick={() => handleCustomerClick(cust.id)}
                              className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md transform group-hover:scale-110 transition-transform">
                                    {cust.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-bold text-gray-900">{cust.name}</div>
                                    <div className="text-xs text-gray-500">ID: CRM-{cust.id.toString().padStart(4, '0')}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-medium">{cust.email}</div>
                                <div className="text-xs text-gray-500">{cust.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center text-sm text-gray-600 font-semibold">
                                  <svg className="w-4 h-4 mr-1.5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                  </svg>
                                  {cust.assignedToName}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 ${
                                    cust.status === "CLOSED" 
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                      : cust.status === "INTERESTED"
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : "bg-amber-50 text-amber-700 border-amber-100"
                                  }`}
                                >
                                  {cust.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCustomerPage(prev => Math.max(prev - 1, 0))}
                        disabled={customerPage === 0}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCustomerPage(prev => Math.min(prev + 1, customerTotalPages - 1))}
                        disabled={customerPage >= customerTotalPages - 1}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing Page <span className="font-medium">{customerPage + 1}</span> of{" "}
                          <span className="font-medium">{customerTotalPages || 1}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCustomerPage(0)}
                            disabled={customerPage === 0}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                          >
                            &laquo; First
                          </button>
                          <button
                            onClick={() => setCustomerPage(prev => Math.max(prev - 1, 0))}
                            disabled={customerPage === 0}
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                          >
                            &lsaquo; Previous
                          </button>
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                            {customerPage + 1}
                          </span>
                          <button
                            onClick={() => setCustomerPage(prev => Math.min(prev + 1, customerTotalPages - 1))}
                            disabled={customerPage >= customerTotalPages - 1}
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                          >
                            Next &rsaquo;
                          </button>
                          <button
                            onClick={() => setCustomerPage(customerTotalPages - 1)}
                            disabled={customerPage >= customerTotalPages - 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                          >
                            Last &raquo;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "applicants" && (
                <div className="space-y-6">

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        Applicants
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Review and manage job applicants.
                      </p>
                    </div>

                    <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                      <span className="text-sm font-semibold text-indigo-600">
                        Total Applicants: {applicants.length}
                      </span>
                    </div>
                  </div>

                  {/* Loading */}
                  {applicantsLoading && (
                    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                      <p className="text-slate-500">
                        Loading applicants...
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {!applicantsLoading && applicantsError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm text-red-600">
                        {applicantsError}
                      </p>
                    </div>
                  )}

                  {/* Empty State */}
                  {!applicantsLoading &&
                    !applicantsError &&
                    applicants.length === 0 && (
                      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                        <h3 className="text-lg font-semibold text-slate-700">
                          No Applicants Found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          There are currently no job applications.
                        </p>
                      </div>
                    )}

                  {/* Applicants Table */}
                  {!applicantsLoading &&
                    !applicantsError &&
                    applicants.length > 0 && (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">

                        <div className="overflow-x-auto">
                          <table className="min-w-full">

                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Applicant
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Contact
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  AI Score
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Recommendation
                                </th>

                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Status
                                </th>

                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                                  Action
                                </th>

                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                              {applicants.map((applicant) => (
                                <tr
                                  key={applicant.id}
                                  className="hover:bg-indigo-50/30 cursor-pointer transition-all group"
                                  onClick={() => {
                                      setSelectedApplicantId(applicant.id);
                                      setIsApplicantModalOpen(true);
                                  }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {applicant.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-semibold text-gray-900">{applicant.name}</div>
                                      <div className="text-xs text-gray-500 font-medium">Applicant ID: #{applicant.id}</div>
                                    </div>
                                  </div>
                                </td>

                                  {/* Contact */}
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-slate-700">
                                      {applicant.email}
                                    </div>

                                    <div className="text-xs text-slate-500 mt-1">
                                      {applicant.phone}
                                    </div>
                                  </td>

                                  {/* Score */}
                                  <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-indigo-600">
                                      {applicant.score !== null &&
                                      applicant.score !== undefined
                                        ? applicant.score
                                        : "N/A"}
                                    </span>
                                  </td>

                                  {/* Recommendation */}
                                  <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-slate-700">
                                      {applicant.recommendation || "N/A"}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="px-6 py-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      applicant.status === "PENDING"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : applicant.status === "ACCEPTED"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {applicant.status || "N/A"}
                                  </span>
                                </td>
                                {/* Action */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-3">

                                    {/* Show buttons only when status is PENDING */}
                                    {applicant.status === "PENDING" && (
                                      <>
                                        {/* Approve Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAcceptApplicant(applicant.id);
                                          }}
                                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold"
                                        >
                                          Approve
                                        </button>

                                        {/* Reject Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRejectApplicant(applicant.id);
                                          }}
                                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-semibold"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}

                                  </div>
                                </td>
                                </tr>
                              ))}

                            </tbody>

                          </table>
                        </div>

                      </div>
                    )}

                </div>
              )}

                
                </div>
              )}

            {/* I : Customer Tab   */}

            </div>
          ) : user.employeeStatus === "BLOCKED" ? (
            <div className="max-w-md mx-auto my-12 bg-white border border-red-200 shadow-xl rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-rose-600"></div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border-2 border-red-100 shadow-sm animate-bounce">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Account Temporarily Blocked</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">You are restricted from performing any customer management activities.</p>
                </div>

                <div className="w-full bg-slate-50 border border-slate-200/60 p-4 rounded-xl text-left text-sm space-y-2">
                  <p className="text-gray-700"><strong>Block Reason:</strong> {user.blockedReason || "No reason specified."}</p>
                  <p className="text-gray-700"><strong>Blocked Until:</strong> {user.blockedUntil ? new Date(user.blockedUntil).toLocaleString() : "Indefinitely"}</p>
                </div>

                {user.blockRemovalRequested ? (
                  <div className="w-full bg-amber-50 border border-amber-200 p-4 rounded-xl text-left text-sm">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      Removal Request Submitted
                    </p>
                    <p className="text-gray-700 font-medium"><strong>Your Reason:</strong> {user.blockRemovalReason}</p>
                    <p className="text-xs text-amber-600 font-semibold mt-2">Please wait for an administrator to review your request.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestUnblock} className="w-full space-y-3">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-gray-600 mb-1 font-semibold">Request Removal Reason</label>
                      <textarea
                        required
                        value={unblockReason}
                        onChange={(e) => setUnblockReason(e.target.value)}
                        placeholder="Explain why you should be unblocked..."
                        className="w-full text-sm border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-white"
                        rows={3}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingUnblock}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm py-2 px-4 rounded-xl transition-all shadow disabled:opacity-50 flex justify-center items-center cursor-pointer font-medium"
                    >
                      {isSubmittingUnblock ? "Submitting..." : "Request Removal of Block"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {user.employeeStatus === "PENDING_RESIGNATION" && (
                <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-pulse">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-amber-800">Resignation Request Pending Approval</p>
                    <p className="text-xs text-amber-700 font-medium">Your request to resign is currently being reviewed by the administration. You can continue managing your customers until the request is approved.</p>
                  </div>
                </div>
              )}
              {/* Employee Stats */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      My Assigned Customers
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.customers}
                    </dd>
                  </div>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      My Closed Deals
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {stats.closedLeads}
                    </dd>
                  </div>
                </div>
              </div>


              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        My Conversion Rate
                      </dt>

                      <p className="mt-1 text-xs text-gray-400">
                        Closed deals vs. assigned customers
                      </p>
                    </div>

                    {/* Circular Progress */}
                    <div className="relative h-20 w-20">
                      <svg
                        className="h-20 w-20 -rotate-90"
                        viewBox="0 0 36 36"
                      >
                        {/* Background Circle */}
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />

                        {/* Progress Circle */}
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${employeeConversionRate}, 100`}
                          className="text-indigo-600 transition-all duration-700"
                        />
                      </svg>

                      {/* Percentage in Center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900">
                          {employeeConversionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Progress Bar */}
                  <div className="mt-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">
                        Performance
                      </span>

                      <span className="text-xs font-bold text-indigo-600">
                        {employeeConversionRate >= 70
                          ? "Excellent"
                          : employeeConversionRate >= 40
                          ? "Good"
                          : "Needs Improvement"}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(employeeConversionRate, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              

              {/* My Customers Table */}
              <div className="bg-slate-50 shadow rounded-lg border border-slate-200/50">
                <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    My Customers
                  </h3>
                  <span className="text-xs text-gray-400">
                    Click a row for details, or 'History' for interactions
                  </span>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {myCustomers.map((cust) => (
                      <tr
                        key={cust.id}
                        onClick={() => handleCustomerClick(cust.id)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cust.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cust.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {cust.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cust.status === "CLOSED" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {cust.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => handleHistoryClick(e, cust.id)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Interest-based Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interested Customers Column */}
                <div className="bg-slate-50 shadow rounded-lg border border-slate-200/50">
                  <div className="px-4 py-5 border-b border-gray-200 bg-green-50 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-green-800">
                      Interested Customers
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {interestedCustomers.length === 0 ? (
                      <li className="px-6 py-4 text-sm text-gray-500 italic">
                        No interested customers yet.
                      </li>
                    ) : (
                      interestedCustomers.map((cust) => (
                        <li
                          key={cust.id}
                          onClick={() => handleCustomerClick(cust.id)}
                          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {cust.name}
                            </p>
                            <button
                              onClick={(e) => handleHistoryClick(e, cust.id)}
                              className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded hover:bg-indigo-200"
                            >
                              History
                            </button>
                          </div>
                          <div className="mt-1 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              {cust.phone}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {cust.email}
                            </p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Not Interested Customers Column */}
                <div className="bg-slate-50 shadow rounded-lg border border-slate-200/50">
                  <div className="px-4 py-5 border-b border-gray-200 bg-red-50 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-red-800">
                      Not Interested Customers
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {notInterestedCustomers.length === 0 ? (
                      <li className="px-6 py-4 text-sm text-gray-500 italic">
                        No "not interested" customers.
                      </li>
                    ) : (
                      notInterestedCustomers.map((cust) => (
                        <li
                          key={cust.id}
                          onClick={() => handleCustomerClick(cust.id)}
                          className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {cust.name}
                            </p>
                            <button
                              onClick={(e) => handleHistoryClick(e, cust.id)}
                              className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-200"
                            >
                              History
                            </button>
                          </div>
                          <div className="mt-1 flex justify-between items-center">
                            <p className="text-xs text-gray-500">
                              {cust.phone}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {cust.email}
                            </p>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Employee"
      >
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onCancel={() => setIsRegisterModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isResignModalOpen}
        onClose={() => setIsResignModalOpen(false)}
        title="Request Resignation"
      >
        <ResignationForm
          onSuccess={() => {
            setIsResignModalOpen(false);
            getProfile()
              .then((response) => {
                login(response.data);
              })
              .catch((err) => console.error("Error refreshing profile after resignation:", err));
            fetchData();
          }}
          onCancel={() => setIsResignModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        title="Add New Customer"
      >
        <AddCustomerForm
          onSuccess={handleAddCustomerSuccess}
          onCancel={() => setIsAddCustomerModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Employee Details"
      >
        <EmployeeDetails employeeId={selectedEmployeeId} onUpdate={fetchData} />
      </Modal>

      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Customer Details & Interactions"
      >
        <CustomerDetails customerId={selectedCustomerId} onUpdate={fetchData} />
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Interaction History"
      >
        <InteractionHistory customerId={selectedCustomerId} />
      </Modal>

      <Modal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        title="Change Password"
      >
      <ChangePasswordForm
          onSuccess={() => setIsChangePasswordModalOpen(false)}
          onCancel={() => setIsChangePasswordModalOpen(false)}
        />
      </Modal>

      <Modal
          isOpen={isApplicantModalOpen}
          onClose={() => setIsApplicantModalOpen(false)}
          title="Applicant Details"
      >
          <ApplicantDetails
              applicantId={selectedApplicantId}
              onUpdate={fetchApplicants}
          />
      </Modal>
    </div>
  );
};