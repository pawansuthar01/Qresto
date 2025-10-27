"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Building2,
  Lock,
  Camera,
  CheckCircle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Restaurant, User } from "@prisma/client";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/ui/loading";
import { isValidEmail, isValidNumber, isValidPassword } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { sendEmailOtp } from "@/hooks/useNotification";
import { Input } from "@/components/ui/input";

// ✅ Utility for safe fetch
const fetchJSON = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [profileImage, setProfileImage] = useLocalStorage<string | null>(
    "profileImage",
    null
  );
  const [profileName, setProfileName] = useLocalStorage<string | null>(
    "profileName",
    null
  );
  // --- State ---
  const [activeTab, setActiveTab] = useState<"user" | "restaurant">("user");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [user, setUser] = useState<User | null>(session?.user as User);
  const [userEdit, setUserEdit] = useState(false);
  const [passwordForgetEmail, setPasswordForgetEmail] = useState({
    show: false,
    title: "",
    message: "you sure ?",
    loading: false,
  });
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurantEdit, setRestaurantEdit] = useState(false);
  const [loadingRestaurant, setLoadingRestaurant] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
    updating: false,
    show_current: true,
    show_new: true,
    show_confirm: true,
    logout: false,
  });

  // --- Auth Guard ---
  useEffect(() => {
    if (status === "unauthenticated") router.push("/signin");
    if (
      session?.user?.status &&
      ["blocked", "suspended"].includes(session.user.status)
    )
      router.push("/signin");
  }, [status]);

  // --- Fetch Restaurant ---
  useEffect(() => {
    if (
      activeTab !== "restaurant" ||
      !session?.user?.restaurantId ||
      restaurant
    )
      return;
    setLoadingRestaurant(true);

    fetchJSON(`/api/restaurants/${session.user.restaurantId}`)
      .then(setRestaurant)
      .catch(() => console.error("Failed to fetch restaurant"))
      .finally(() => setLoadingRestaurant(false));
  }, [activeTab, session, restaurant]);

  useEffect(() => {
    if (activeTab !== "user" || !session?.user?.id || user) {
      return;
    }
    setLoading(true);

    fetchJSON(`/api/users/${session?.user.id}`)
      .then((data) => {
        setUser(data);
      })
      .catch(() => console.error("Failed to fetch user"))
      .finally(() => setLoading(false));
  }, [activeTab, session]);

  // --- Generic helpers ---
  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handelSendForgetEmail = async () => {
    if (!session?.user?.email) {
      toast({
        title: "something wont wrong...",
        description: "please try again sometime",
        variant: "destructive",
      });
      setPasswordForgetEmail({
        show: false,
        loading: false,
        message: "",
        title: "",
      });
      return;
    }
    const res = await sendEmailOtp(session?.user.email);
    if (res?.message) {
      toast({
        title: "check your email",
        description:
          "forget password email code send your email check your email",
        variant: "default",
      });
    }
    setPasswordForgetEmail({
      show: false,
      loading: false,
      message: "",
      title: "",
    });
  };

  const simulateUpdate = async (type: "user" | "restaurant", msg: string) => {
    if (isSaving) {
      return;
    }
    try {
      if (type == "user") {
        if (!user?.name || !user?.image) {
          toast({
            title: "info Error",
            description: "Please fill all the fields",
            variant: "destructive",
          });
          return;
        }
        const updateData = {
          name: user?.name,
          image: user?.image,
        };
        if (user.name.length > 12) {
          toast({
            title: "type Error..",
            description: "owner name is 12 char max.. length",
            variant: "destructive",
          });
          return;
        }
        setIsSaving(true);
        const res = await fetch(`/api/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify(updateData),
        });
        const data = await res?.json();

        setIsSaving(false);
        if (!res?.ok) {
          toast({
            title: "Error during info Update",
            description: data.error || "something wont wrong...",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "successfully update info",
          description: "info updated...",
          variant: "default",
        });
        setUser(data);
        setUserEdit(false);
        setProfileImage(data?.image ?? profileImage);
        setProfileName(data?.name ?? profileName);
      } else if (type == "restaurant") {
        if (
          !restaurant?.name ||
          !restaurant?.logoUrl ||
          !restaurant.email ||
          !restaurant.address ||
          !restaurant.description ||
          !restaurant.phone
        ) {
          toast({
            title: "info Error",
            description: "Please fill all the fields",
            variant: "destructive",
          });
          return;
        }
        const updateData = {
          name: restaurant?.name,
          logoUrl: restaurant?.logoUrl,
          email: restaurant?.email,
          address: restaurant?.address,
          description: restaurant?.description,
          phone: restaurant?.phone,
        };
        if (restaurant.name.length > 20) {
          toast({
            title: "type Error..",
            description: "restaurant name is 20 char max.. length",
            variant: "destructive",
          });
          return;
        }

        if (!isValidEmail(restaurant?.email)) {
          toast({
            title: "Type Error",
            description: "please enter valid email address",
            variant: "destructive",
          });
          return;
        }
        if (!isValidNumber(restaurant?.phone)) {
          toast({
            title: "Type Error",
            description: "please enter valid phone number",
            variant: "destructive",
          });
          return;
        }
        setIsSaving(true);
        const res = await fetch(`/api/restaurants/${restaurant.id}`, {
          method: "PATCH",
          body: JSON.stringify(updateData),
        });
        const data = await res?.json();

        setIsSaving(false);
        if (!res?.ok) {
          toast({
            title: "Error during info Update",
            description: data.message || "something wont wrong...",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "successfully update restaurant",
          description: "restaurant updated...",
          variant: "default",
        });
        setRestaurant(data);
        setRestaurantEdit(false);
      }
      showSuccess(msg);
    } catch {
      alert("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (type: "user" | "restaurant") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        console.log(type);
        if (type === "user" && user) {
          setUser((prev) => ({ ...prev!, image: imageUrl }));
        }

        if (type === "restaurant" && restaurant)
          setRestaurant((prev) => ({ ...prev!, logoUrl: imageUrl }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handlePasswordChange = async () => {
    if (!password.current) {
      toast({
        title: "Type Error",
        description: "please enter current password...",
        variant: "destructive",
      });
      return;
    }
    if (password.new !== password.confirm) {
      toast({
        title: "Type Error",
        description: "Passwords do not match!",
        variant: "destructive",
      });
      return;
    }
    if (password.new.length < 8) {
      toast({
        title: "Type Error",
        description: "Password must be at least 8 characters!",
        variant: "destructive",
      });
      return;
    }
    if (!isValidPassword(password.new)) {
      toast({
        title: "Type Error",
        description: "Password must be at least 8 characters!",
        variant: "destructive",
      });
    }
    if (!isValidPassword(password.new)) {
      toast({
        title: "Type Error",
        description:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character!",
        variant: "destructive",
      });
      return;
    }
    setPassword({ ...password, updating: true });
    const res = await fetch(`/api/users/${session?.user.id}/password`, {
      method: "PATCH",
      body: JSON.stringify(password),
    });
    const data = await res?.json();
    setPassword({ ...password, updating: false });

    if (!res?.ok) {
      toast({
        title: "Error during update password",
        description: data.error || "something wont wrong..",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "successfully update",
      description: data.message || "something wont wrong..",
      variant: "default",
    });
  };
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 max-sm:py-2 max-sm:px-0">
        <div className="bg-white rounded-xl shadow  max-sm:p-3 p-6 mb-6">
          <h1 className="text-2xl font-bold max-sm:text-xl text-gray-900">
            Profile Settings
          </h1>
          <p className="text-gray-600  max-sm:text-sm">
            Manage your account and restaurant details
          </p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3  max-sm:px-2 max-sm:py-2 rounded-lg flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess("")}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            <TabButton
              active={activeTab === "user"}
              label="User"
              icon={UserIcon}
              onClick={() => setActiveTab("user")}
              activeColor="bg-blue-600 text-white hover:bg-blue-700"
            />
            {user?.restaurantId && (
              <TabButton
                active={activeTab === "restaurant"}
                label="Restaurant"
                icon={Building2}
                onClick={() => setActiveTab("restaurant")}
                activeColor="bg-purple-600 text-white hover:bg-purple-700"
              />
            )}
          </div>

          <div className="p-6  max-sm:p-3">
            {activeTab === "user" && (
              <UserTab
                user={user}
                setPasswordForget={setPasswordForgetEmail}
                loading={isLoading}
                userEdit={userEdit}
                setUser={setUser}
                setUserEdit={setUserEdit}
                isSaving={isSaving}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                password={password}
                setPassword={setPassword}
                handlePasswordChange={handlePasswordChange}
                handleUserUpdate={() => simulateUpdate("user", "User updated!")}
                handleImageUpload={() => handleImageUpload("user")}
              />
            )}

            {activeTab === "restaurant" && (
              <RestaurantTab
                restaurant={restaurant}
                loading={loadingRestaurant}
                restaurantEdit={restaurantEdit}
                setRestaurant={setRestaurant}
                setRestaurantEdit={setRestaurantEdit}
                isSaving={isSaving}
                handleImageUpload={() => handleImageUpload("restaurant")}
                handleRestaurantUpdate={() =>
                  simulateUpdate("restaurant", "Restaurant updated!")
                }
              />
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        loading={passwordForgetEmail.loading}
        title={passwordForgetEmail.title}
        onConfirm={() => {
          handelSendForgetEmail();
          setPasswordForgetEmail({ ...passwordForgetEmail, loading: true });
        }}
        message={passwordForgetEmail.message}
        open={passwordForgetEmail.show}
        onClose={() =>
          setPasswordForgetEmail({
            ...passwordForgetEmail,
            show: false,
            loading: false,
          })
        }
      />
    </MainLayout>
  );
}

/* ----------------------------------------------------------------
   Reusable UI Components
-----------------------------------------------------------------*/

function TabButton({ active, label, icon: Icon, onClick, activeColor }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition ${
        active
          ? ` ${activeColor}  `
          : `bg-gray-50 text-gray-600 hover:bg-gray-100`
      }`}
    >
      <Icon className="w-5 h-5" /> <span>{label}</span>
    </button>
  );
}

function InputField({ label, value, onChange, disabled, type = "text" }: any) {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        disabled={disabled}
        value={value || ""}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg text-gray-800 ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
        }`}
      />
    </div>
  );
}

function ProfileImage({ src, name, editable, onUpload, color, email }: any) {
  return (
    <div className=" flex gap-2 max-sm:flex-col max-sm:justify-center max-sm:items-center w-full h-full">
      <div className="relative w-28 h-28">
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div
            className={`w-full h-full rounded-full flex items-center justify-center bg-${color}-100 text-${color}-600 text-3xl font-bold`}
          >
            {name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        {editable && (
          <button
            onClick={onUpload}
            className="absolute bottom-1 right-1 bg-gray-800 text-white p-1.5 rounded-full hover:bg-gray-700"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className=" flex flex-col justify-center max-sm:items-center ">
        <p className="text-gray-800 font-semibold text-lg ">{name}</p>
        {email && (
          <p className="text-gray-500 text-sm font-semibold ">{email}</p>
        )}
      </div>
    </div>
  );
}

function ActionButtons({
  editMode,
  onEdit,
  onSave,
  onCancel,
  color,
  isSaving,
}: any) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      {!editMode ? (
        <button
          onClick={onEdit}
          className={`px-4 py-2 rounded-lg bg-${color}-600 hover:bg-${color}-700 text-white font-semibold`}
        >
          Edit
        </button>
      ) : (
        <>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-lg bg-${color}-600 hover:bg-${color}-700 text-white font-semibold disabled:opacity-50`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   User & Restaurant Tabs
-----------------------------------------------------------------*/

function UserTab({
  user,
  loading,
  setPasswordForget,
  userEdit,
  setUser,
  setUserEdit,
  isSaving,
  showPassword,
  setShowPassword,
  password,
  setPassword,
  handlePasswordChange,
  handleUserUpdate,
  handleImageUpload,
}: any) {
  if (loading) return <Loading h="h-full" />;

  if (!user) return <p>No user data available.</p>;

  return (
    <div className="space-y-6">
      <ProfileImage
        src={user.image}
        name={user.name}
        editable={userEdit}
        email={user.email}
        color="blue"
        onUpload={handleImageUpload}
      />

      <InputField
        label="Full Name"
        value={user.name}
        disabled={!userEdit}
        onChange={(e: any) =>
          setUser((u: any) => ({ ...u, name: e.target.value }))
        }
      />
      <div>
        <InputField
          label="Email"
          value={user.email}
          disabled={true}
          onChange={(e: any) =>
            setUser((u: any) => ({ ...u, email: e.target.value }))
          }
        />
        <p className="text-gray-500 text-xs mt-1">
          you can not update the Email if you need this update than contact
          support
        </p>
      </div>

      <div className="border-t pt-4">
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
        >
          <Lock className="w-5 h-5" /> Change Password
        </button>

        {showPassword && (
          <div className="mt-4 space-y-3 bg-gray-50 p-4  max-sm:p-2 rounded-lg ">
            {["current", "new", "confirm"].map((key, index) => (
              <div key={key} className=" relative">
                <InputField
                  disabled={password.updating}
                  key={key}
                  label={`${
                    key === "current"
                      ? "Current"
                      : key === "new"
                      ? "New"
                      : "Confirm"
                  } Password`}
                  type={password[`show_` + `${key}`] ? "password" : "text"}
                  value={password[key]}
                  onChange={(e: any) =>
                    setPassword((p: any) => ({ ...p, [key]: e.target.value }))
                  }
                />
                {password[`show_` + `${key}`] ? (
                  <span
                    onClick={() =>
                      setPassword((p: any) => ({
                        ...p,
                        [`show_` + `${key}`]: false,
                      }))
                    }
                    className=" absolute right-3  cursor-pointer top-[50%] text-gray-800 hover:scale-110"
                    key={`show_` + `${key}`}
                  >
                    <Eye className="w-5 h-5" />
                  </span>
                ) : (
                  <span
                    onClick={() =>
                      setPassword((p: any) => ({
                        ...p,
                        [`show_` + `${key}`]: true,
                      }))
                    }
                    className=" absolute right-3 cursor-pointer  top-[50%] text-gray-800"
                    key={`show_` + `${key}` + `${index}`}
                  >
                    <EyeOff className="w-5 h-" />
                  </span>
                )}
              </div>
            ))}
            <div className=" flex gap-2 items-center">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                logout this device
              </label>
              <Input
                type="checkbox"
                disabled={password.updating}
                value={password.logout}
                onChange={() => setPassword({ ...password, logout: true })}
                className="w-4 h-4 cursor-pointer "
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={password.updating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              {password.updating ? "Updating..." : "Update Password"}
            </button>
            <p
              onClick={() => {
                setPasswordForget({
                  show: true,
                  title: "You sure send forget password",
                  message: "An email has been sent to reset your password.",
                  loading: false,
                });
              }}
              className=" text-red-400 text-sm flex justify-end cursor-pointer hover:text-red-500 hover:underline "
            >
              send email to forget password ?
            </p>
          </div>
        )}
      </div>

      <ActionButtons
        editMode={userEdit}
        onEdit={() => setUserEdit(true)}
        onSave={handleUserUpdate}
        onCancel={() => setUserEdit(false)}
        color="blue"
        isSaving={isSaving}
      />
    </div>
  );
}

function RestaurantTab({
  restaurant,
  loading,
  restaurantEdit,
  setRestaurant,
  setRestaurantEdit,
  isSaving,
  handleImageUpload,
  handleRestaurantUpdate,
}: any) {
  if (loading) return <Loading h="h-full" />;

  if (!restaurant) return <p>No restaurant data available.</p>;

  return (
    <div className="space-y-6">
      <ProfileImage
        src={restaurant.logoUrl}
        name={restaurant.name}
        editable={restaurantEdit}
        email={restaurant.email}
        color="purple"
        onUpload={handleImageUpload}
      />

      <InputField
        label="Restaurant Name"
        value={restaurant.name}
        disabled={!restaurantEdit}
        onChange={(e: any) =>
          setRestaurant((r: any) => ({ ...r, name: e.target.value }))
        }
      />
      <InputField
        label="Email"
        value={restaurant.email}
        disabled={!restaurantEdit}
        onChange={(e: any) =>
          setRestaurant((r: any) => ({ ...r, email: e.target.value }))
        }
      />
      <InputField
        label="phone"
        type="number"
        value={restaurant.phone}
        disabled={!restaurantEdit}
        onChange={(e: any) =>
          setRestaurant((r: any) => ({ ...r, phone: e.target.value }))
        }
      />
      <InputField
        label="Address"
        value={restaurant.address}
        disabled={!restaurantEdit}
        onChange={(e: any) =>
          setRestaurant((r: any) => ({ ...r, address: e.target.value }))
        }
      />
      <div>
        <label htmlFor="description">Description</label>
        <Textarea
          id="description"
          value={restaurant.description}
          disabled={!restaurantEdit}
          onChange={(e: any) =>
            setRestaurant((r: any) => ({ ...r, description: e.target.value }))
          }
        />
      </div>
      <ActionButtons
        editMode={restaurantEdit}
        onEdit={() => setRestaurantEdit(true)}
        onSave={handleRestaurantUpdate}
        onCancel={() => setRestaurantEdit(false)}
        color="purple"
        isSaving={isSaving}
      />
    </div>
  );
}
