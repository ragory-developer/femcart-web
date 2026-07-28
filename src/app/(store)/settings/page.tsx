"use client";

import AddressModal from "@/components/dashboard/AddressModal";
import PhoneVerificationModal from "@/components/dashboard/PhoneVerificationModal";
import UserSidebar from "@/components/dashboard/UserSidebar";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/lib/config";
import { showToast } from "@/lib/toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  Cake,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    dateOfBirth: "",
  });

  // Addresses State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Phone Change Verification State
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  // Security State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordFormVisible, setIsPasswordFormVisible] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: true,
  });

  useEffect(() => {
    if (user) {
      if (user.isGuest) {
        router.replace("/profile");
        return;
      }

      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
      });
      if (user.notificationPrefs) {
        setNotifications(user.notificationPrefs);
      }
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setAddresses(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // If phone number is changed, we need OTP verification first
    if (profileData.phone !== user?.phone) {
      try {
        const token =
          localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/users/request-phone-change`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPhone: profileData.phone }),
        });
        const json = await res.json();
        if (json.success) {
          setIsPhoneModalOpen(true);
          setLoading(false);
          return;
        } else {
          setMessage({
            type: "error",
            text: json.message || "Failed to initiate phone change",
          });
          setLoading(false);
          return;
        }
      } catch (err) {
        setMessage({
          type: "error",
          text: "Failed to initiate phone verification",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          phone: profileData.phone,
          gender: profileData.gender,
          dateOfBirth: profileData.dateOfBirth,
        }),
      });

      const json = await res.json();
      if (json.success) {
        await refreshProfile();
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        setMessage({
          type: "error",
          text: json.message || "Failed to update profile",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 2MB" });
      return;
    }

    // Since we're using a fake upload for demonstration, we'll convert it to base64.
    // In a real app, you'd upload this to an S3 bucket or similar and send the URL.
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const token =
          localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/users/avatar`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatarUrl: base64String }),
        });

        const json = await res.json();
        if (json.success) {
          await refreshProfile();
          showToast.success("Avatar updated");
        } else {
          showToast.error(json.message || "Failed to update avatar");
        }
      } catch (error) {
        showToast.error("Failed to update avatar");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Password updated successfully!" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsPasswordFormVisible(false);
      } else {
        setMessage({
          type: "error",
          text: json.message || "Failed to update password",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred while updating password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    const newPrefs = { ...notifications, [key]: value };
    setNotifications(newPrefs);

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      await fetch(`${API_URL}/api/users/notifications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPrefs),
      });
      // Optionally show a silent toast or let it be invisible
      showToast.success("Preferences updated");
    } catch (err) {
      showToast.error("Failed to update preferences");
      // revert on failure
      setNotifications(notifications);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (err) {
      showToast.error("Failed to delete address");
    }
  };

  const tabs = [
    { id: "profile", title: "Profile", icon: User },
    { id: "addresses", title: "Addresses", icon: MapPin },
    { id: "notifications", title: "Notifications", icon: Bell },
    { id: "security", title: "Security", icon: Shield },
  ];

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] dark:bg-gray-950 min-h-[100dvh] py-12">
      {isAddressModalOpen && (
        <AddressModal
          address={editingAddress}
          onClose={() => {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          }}
          onSuccess={fetchAddresses}
        />
      )}

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-80 shrink-0">
            <UserSidebar />
          </aside>

          <main className="flex-grow">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                Settings
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                Configure your account and preferences
              </p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-2 mb-8 bg-white dark:bg-gray-900 p-2 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto pb-2 md:pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "profile" && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/20 dark:shadow-none">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight italic">
                      Personal Information
                    </h2>

                    {message && (
                      <div
                        className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                          message.type === "success"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-pink-50 text-pink-600 border border-pink-100"
                        }`}
                      >
                        {message.type === "success" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <AlertCircle size={18} />
                        )}
                        {message.text}
                      </div>
                    )}

                    <div className="mb-10 flex flex-col sm:flex-row items-center gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center shrink-0">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl sm:text-5xl font-black text-blue-600 uppercase">
                              {user?.name?.charAt(0) || "U"}
                            </span>
                          )}
                        </div>
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center cursor-pointer">
                          <Edit3 className="text-white mb-1" size={20} />
                          <span className="text-white text-[10px] font-bold uppercase">
                            Change
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          Profile Picture
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG or WebP under 2MB
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleProfileSubmit}
                      className="space-y-6 max-w-2xl"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <User
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="text"
                              required
                              value={profileData.name}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-900 dark:text-white transition-all"
                              placeholder="Your Name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="tel"
                              required
                              value={profileData.phone}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-900 dark:text-white transition-all"
                              placeholder="Your Phone"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Gender
                          </label>
                          <div className="relative">
                            <Users
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <select
                              value={profileData.gender}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  gender: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-900 dark:text-white transition-all appearance-none"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <ChevronRight
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none"
                              size={16}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Date of Birth
                          </label>
                          <div className="relative">
                            <Cake
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                              size={18}
                            />
                            <input
                              type="date"
                              value={profileData.dateOfBirth}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  dateOfBirth: e.target.value,
                                })
                              }
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-900 dark:text-white transition-all uppercase text-xs tracking-widest"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                          Email Address (Read-only)
                        </label>
                        <div className="relative opacity-60">
                          <Mail
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                          />
                          <input
                            type="email"
                            disabled
                            value={profileData.email}
                            className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 px-10 py-5 bg-gray-900 border-none dark:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          <>
                            <Save size={20} /> Save Changes
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "addresses" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">
                        Saved Addresses
                      </h2>
                      <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform"
                      >
                        <Plus size={16} /> Add New
                      </button>
                    </div>

                    {addressesLoading ? (
                      <div className="p-12 flex justify-center">
                        <Loader2
                          className="animate-spin text-blue-600"
                          size={32}
                        />
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center">
                        <MapPin
                          className="mx-auto text-gray-200 dark:text-gray-800 mb-4"
                          size={48}
                        />
                        <p className="text-gray-500 font-bold">
                          No saved addresses found.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 group hover:border-blue-500/30 transition-all"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                  <MapPin size={18} className="text-blue-600" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">
                                    {addr.label}
                                  </span>
                                  <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">
                                    {addr.isDefault && (
                                      <CheckCircle2
                                        size={12}
                                        className="inline mr-1 text-green-500"
                                      />
                                    )}
                                    {addr.city}, {addr.area}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingAddress(addr);
                                    setIsAddressModalOpen(true);
                                  }}
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteAddress(addr.id)}
                                  className="p-2 text-gray-400 hover:text-pink-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                              {addr.address}
                            </p>
                            <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-gray-400 italic">
                                {addr.recipientName}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 italic">
                                {addr.recipientPhone}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-12 shadow-xl shadow-gray-200/20 dark:shadow-none">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight italic">
                      Notification Preferences
                    </h2>

                    <div className="space-y-6">
                      {[
                        {
                          key: "orderUpdates",
                          title: "Order Updates",
                          desc: "Get notified about your order status changes",
                        },
                        {
                          key: "promotions",
                          title: "Promotions",
                          desc: "Receive info about sales and special offers",
                        },
                        {
                          key: "newsletter",
                          title: "Newsletter",
                          desc: "Weekly digest of our best products",
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between py-6 border-b border-gray-50 dark:border-gray-800 last:border-0"
                        >
                          <div>
                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-500 font-medium">
                              {item.desc}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={
                                notifications[
                                  item.key as keyof typeof notifications
                                ] || false
                              }
                              onChange={(e) =>
                                handleNotificationChange(
                                  item.key,
                                  e.target.checked,
                                )
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-gray-200/20 dark:shadow-none">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tight italic">
                      Account Security
                    </h2>

                    {message && (
                      <div
                        className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                          message.type === "success"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-pink-50 text-pink-600 border border-pink-100"
                        }`}
                      >
                        {message.type === "success" ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <AlertCircle size={18} />
                        )}
                        {message.text}
                      </div>
                    )}

                    <div className="p-6 md:p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="p-3 md:p-4 bg-white dark:bg-blue-800 rounded-2xl shadow-sm shrink-0">
                          <Shield
                            size={24}
                            className="text-blue-600 dark:text-blue-300"
                          />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            Password Management
                          </h4>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                            Keep your account secure
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setIsPasswordFormVisible(!isPasswordFormVisible)
                        }
                        className="px-6 md:px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform"
                      >
                        {isPasswordFormVisible ? "Cancel" : "Change Password"}
                      </button>
                    </div>

                    {isPasswordFormVisible && (
                      <form
                        onSubmit={handlePasswordSubmit}
                        className="max-w-md space-y-6 bg-gray-50 dark:bg-gray-950 p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800"
                      >
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full px-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-900 dark:text-white transition-all"
                            placeholder="Enter current password"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-900 dark:text-white transition-all"
                            placeholder="Enter new password"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl outline-none focus:border-blue-500 font-bold text-gray-900 dark:text-white transition-all"
                            placeholder="Confirm new password"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 flex items-center justify-center"
                        >
                          {isChangingPassword ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            "Update Password"
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        newPhone={profileData.phone}
        onSuccess={async () => {
          await refreshProfile();
          setMessage({
            type: "success",
            text: "Phone number updated successfully!",
          });
        }}
      />
    </div>
  );
}
