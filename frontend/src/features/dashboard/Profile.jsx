import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserProfile,
  updateProfile,
  uploadProfileImage,
  updateSkills,
} from "../../store/slices/userSlice";
import FileUpload from "../../components/files/FileUpload";
import { toast } from "react-toastify";
import { Chip, Typography } from "@mui/material";
import {
  HiOutlineCamera,
  HiOutlineUser,
  HiOutlineBadgeCheck,
  HiOutlineInformationCircle,
  HiOutlineTag,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";
import { Autocomplete, TextField, Backdrop } from "@mui/material";
import api from "../../api/api";
import axios from 'axios';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [companyEditMode, setCompanyEditMode] = useState(false);
  const [companyName, setCompanyName] = useState(user?.company_name || '');
  const [companyNameLoading, setCompanyNameLoading] = useState(false);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, user]);

  // Fetch all skills for Autocomplete
  useEffect(() => {
    setSkillsLoading(true);
    api
      .get("/users/skills")
      .then((res) => setAllSkills(res.data || []))
      .finally(() => setSkillsLoading(false));
  }, []);

  // Fetch company name if user is company
  useEffect(() => {
    if (user?.role === 'company' && user?.company_id) {
      api.get(`/companies/${user.company_id}`)
        .then(res => setCompanyName(res.data?.company?.name || ''));
    }
  }, [user]);

  const handleImageUpload = async (files) => {
    if (files.length > 0) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("photo", files[0]);
        await dispatch(uploadProfileImage(formData));
        const userId = user?._id || user?.id;
        if (userId) await dispatch(fetchUserProfile(userId));
        toast.success("Profile picture updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        toast.error("Failed to upload image. Please try again.", {
          position: "top-right",
          autoClose: 3456,
        });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      await dispatch(updateProfile(values));
      const userId = user?._id || user?.id;
      if (userId) await dispatch(fetchUserProfile(userId));
      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      setEditMode(false);
    } catch (err) {
      toast.error(
        err.message || "Failed to update profile. Please try again.",
        {
          position: "top-right",
          autoClose: 3456,
        }
      );
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      hourlyRate: profile?.hourlyRate || 0,
      skills: profile?.skills || [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      bio: Yup.string().max(500, "Bio must be less than 500 characters"),
      hourlyRate: Yup.number().min(0, "Hourly rate must be positive"),
    }),
    onSubmit: handleProfileUpdate,
  });

  const handleAddSkill = async () => {
    if (!profile || !Array.isArray(profile.skills)) return;
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      try {
        const updatedSkills = [...profile.skills, newSkill.trim()];
        await dispatch(updateSkills(updatedSkills));
        toast.success(`Skill "${newSkill.trim()}" added successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        setNewSkill("");
      } catch (err) {
        toast.error("Failed to add skill. Please try again.", {
          position: "top-right",
          autoClose: 3456,
        });
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    if (!profile || !Array.isArray(profile.skills)) return;
    try {
      const updatedSkills = profile.skills.filter(
        (skill) => skill !== skillToRemove
      );
      await dispatch(updateSkills(updatedSkills));
      toast.success(`Skill "${skillToRemove}" removed successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error("Failed to remove skill. Please try again.", {
        position: "top-right",
        autoClose: 3456,
      });
    }
  };

  const handleSetProfilePhoto = async (imgUrl) => {
    try {
      await api.put("/users/profile", { photo: imgUrl });
      await dispatch(fetchUserProfile(profile.id));
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Failed to update profile photo.");
    }
  };

  const handleCompanyNameUpdate = async () => {
    if (!companyName.trim()) {
      toast.error('Company name cannot be empty.');
      return;
    }
    setCompanyNameLoading(true);
    try {
      await api.patch(`/users/companies/${user.company_id}/name`, { name: companyName });
      toast.success('Company name updated!');
      setCompanyEditMode(false);
      // Optionally update Redux/auth state here
    } catch (err) {
      toast.error('Failed to update company name.');
    } finally {
      setCompanyNameLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-indigo-900 px-2 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-5xl min-h-[400px] lg:h-[500px] flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 bg-white/80 dark:bg-indigo-900/90 backdrop-blur-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-800 p-3 sm:p-6 md:p-8 lg:p-10 xl:p-14 mx-auto transition-all duration-300">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center lg:w-1/3 w-full mb-4 sm:mb-6 lg:mb-0">
          <div className="relative group bg-white/30 dark:bg-indigo-800/60 backdrop-blur-lg rounded-full shadow-xl border-2 sm:border-4 border-indigo-200 dark:border-indigo-700 p-1 sm:p-2 mb-3 sm:mb-4">
            <img
              src={
                profile?.photo ? `${profile.photo}?${Date.now()}` : "/logo.svg"
              }
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-full object-cover shadow-lg"
            />
            {editMode && (
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white rounded-full shadow p-1 cursor-pointer group-hover:bg-indigo-100 transition">
                <label className="cursor-pointer h-6 w-6 sm:h-8 sm:w-8">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleImageUpload([file]);
                    }}
                    disabled={uploadingImage}
                  />
                  <HiOutlineCamera className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </label>
              </div>
            )}
            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2 mb-0 text-center">
                <HiOutlineUser className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />{" "}
                {profile?.name}
              </h2>
              <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 rounded-lg text-xs sm:text-sm font-semibold h-6 sm:h-8">
                <HiOutlineBadgeCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                {user?.role}
              </span>
            </div>
            {user?.role === "freelancer" && (
              <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg text-xs sm:text-sm font-semibold h-6 sm:h-8 mt-2">
                <span className="font-light text-green-600 text-sm sm:text-md">₹</span>
                {profile?.hourlyRate?.toLocaleString("en-IN") || 0}/hr
              </span>
            )}
          </div>
        </div>
        {/* Form Section */}
        <div className="flex-1 w-full max-h-[350vh] flex flex-col justify-center">
          <div className="bg-white/70 dark:bg-indigo-950/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-800 p-3 sm:p-6 md:p-8 mt-2 max-h-[70vh] lg:max-h-[350px] transition-all duration-300">
            {editMode ? (
              <>
                {/* Blurred Backdrop */}
                <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[100]" />
                {/* Modal */}
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 xs:p-4">
                  <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl min-h-[350px] pt-6 sm:pt-8 xs:pt-10 max-h-[95vh] sm:max-h-[90vh] bg-white dark:bg-indigo-900 rounded-xl sm:rounded-2xl xs:rounded-3xl shadow-2xl border border-gray-200 dark:border-indigo-800 overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-900 dark:to-indigo-800 px-3 sm:px-4 xs:px-6 sm:px-8 py-3 sm:py-4 xs:py-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                          <HiOutlinePencil className="w-5 h-5 sm:w-6 sm:h-6" />
                          Edit Profile
                        </h3>
                        <button
                          onClick={() => setEditMode(false)}
                          className="text-white hover:text-gray-200 dark:hover:text-indigo-200 transition-colors p-1 rounded-full hover:bg-white/10 dark:hover:bg-indigo-800/40"
                        >
                          <HiOutlineX className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                      </div>
                    </div>
                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 xs:p-5 sm:p-8">
                      {editMode && (
                        <div className="flex flex-col items-center mb-4">
                          <div className="relative group bg-white/30 dark:bg-indigo-800/60 backdrop-blur-lg rounded-full shadow-xl border-2 sm:border-4 border-indigo-200 dark:border-indigo-700 p-1 sm:p-2 mb-2">
                            <img
                              src={profile?.photo ? `${profile.photo}?${Date.now()}` : "/logo.svg"}
                              alt="Profile"
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg"
                            />
                            <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white rounded-full shadow p-1 cursor-pointer group-hover:bg-indigo-100 transition">
                              <label className="cursor-pointer h-6 w-6 sm:h-8 sm:w-8">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleImageUpload([file]);
                                  }}
                                  disabled={uploadingImage}
                                />
                                <HiOutlineCamera className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                              </label>
                            </div>
                            {uploadingImage && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 sm:border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-300">Update Profile Image</span>
                        </div>
                      )}
                      <form
                        onSubmit={formik.handleSubmit}
                        className="space-y-5 sm:space-y-6 md:space-y-7"
                      >
                        {/* Full Name */}
                        <div className="space-y-2">
                          <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineUser className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            Full Name
                          </label>
                          <input
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 dark:border-indigo-700 dark:bg-indigo-950 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm sm:text-base transition-colors"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {/* Role */}
                        <div className="space-y-2">
                          <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineBadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            Role
                          </label>
                          <div className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-50 dark:bg-indigo-800 text-gray-700 dark:text-indigo-100 font-medium capitalize flex items-center gap-2 border border-gray-200 dark:border-indigo-700">
                            <span className="text-indigo-600 dark:text-indigo-300 text-sm sm:text-base">
                              {user?.role}
                            </span>
                          </div>
                        </div>
                        {/* Hourly Rate */}
                        {user?.role === "freelancer" && (
                          <div className="space-y-2">
                            <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                              <span className="font-light text-green-600 text-sm sm:text-md">
                                ₹
                              </span>
                              Hourly Rate
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">
                                ₹
                              </span>
                              <input
                                className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 rounded-lg border border-gray-300 dark:border-green-900 dark:bg-indigo-950 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-sm sm:text-base transition-colors"
                                name="hourlyRate"
                                type="number"
                                value={formik.values.hourlyRate}
                                onChange={formik.handleChange}
                                placeholder="0"
                                min={0}
                              />
                            </div>
                          </div>
                        )}
                        {/* About Section */}
                        <div className="space-y-2">
                          <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineInformationCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            About
                          </label>
                          <textarea
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 dark:border-indigo-700 dark:bg-indigo-950 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm sm:text-base transition-colors resize-none"
                            name="bio"
                            value={formik.values.bio}
                            onChange={formik.handleChange}
                            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                            rows={4}
                          />
                        </div>
                        {/* Skills Section */}
                        <div className="space-y-2">
                          <label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineTag className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                            Skills
                          </label>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Autocomplete
                              multiple
                              freeSolo
                              options={allSkills}
                              value={formik.values.skills || []}
                              inputValue={skillInput}
                              onInputChange={(event, newInputValue) =>
                                setSkillInput(newInputValue)
                              }
                              onChange={(event, value) =>
                                formik.setFieldValue("skills", value)
                              }
                              filterSelectedOptions
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Search and add skills..."
                                  size="small"
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "8px",
                                      "&:hover fieldset": {
                                        borderColor: "#6366f1",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderColor: "#6366f1",
                                      },
                                    },
                                  }}
                                />
                              )}
                              sx={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-all flex items-center justify-center gap-1 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-sm sm:text-base"
                              onClick={() => {
                                const trimmed = skillInput.trim();
                                if (
                                  trimmed &&
                                  !(formik.values.skills || []).includes(
                                    trimmed
                                  )
                                ) {
                                  formik.setFieldValue("skills", [
                                    ...(formik.values.skills || []),
                                    trimmed,
                                  ]);
                                  setSkillInput("");
                                }
                              }}
                              disabled={
                                !skillInput.trim() ||
                                (formik.values.skills || []).includes(
                                  skillInput.trim()
                                )
                              }
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    {/* Modal Footer */}
                    <div className="bg-gray-50 dark:bg-indigo-950 px-3 sm:px-4 xs:px-6 sm:px-8 py-3 sm:py-4 xs:py-5 border-t border-gray-200 dark:border-indigo-800">
                      <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 justify-end">
                        <button
                          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-indigo-800 dark:hover:bg-indigo-700 dark:text-indigo-100 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                          onClick={() => setEditMode(false)}
                          type="button"
                        >
                          <HiOutlineX className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 dark:from-indigo-700 dark:to-indigo-900 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md text-sm sm:text-base"
                          onClick={formik.handleSubmit}
                          type="button"
                        >
                          <HiOutlineCheck className="w-4 h-4" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2 text-center lg:text-left">
                  <HiOutlineUser className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />{" "}
                  {profile?.name}
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-1 justify-center lg:justify-start">
                  <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 rounded-lg text-xs sm:text-sm font-semibold h-6 sm:h-8">
                    <HiOutlineBadgeCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                    {user?.role}
                  </span>
                  {user?.role === "freelancer" && (
                    <span className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg text-xs sm:text-sm font-semibold h-6 sm:h-8">
                      <span className="font-light text-green-600 text-sm sm:text-md">
                        ₹
                      </span>
                      {profile?.hourlyRate?.toLocaleString("en-IN") || 0}/hr
                    </span>
                  )}
                </div>
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                    <HiOutlineInformationCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />{" "}
                    About
                  </h3>
                  <p className="text-sm sm:text-base text-indigo-800 bg-indigo-50 rounded-lg p-3 sm:p-4 min-h-[60px] dark:bg-indigo-900/50 dark:text-indigo-100">
                    {profile?.bio || "No bio provided."}
                  </p>
                </div>
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                    <HiOutlineTag className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length > 0 ? (
                      profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 sm:px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs sm:text-sm font-medium shadow-sm flex items-center gap-1"
                        >
                          <HiOutlineTag className="w-3 h-3 sm:w-4 sm:h-4" /> {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-indigo-400 text-sm">No skills added</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 w-full justify-center lg:justify-end">
                  <button
                    className="px-4 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow transition-all flex items-center gap-2 text-sm sm:text-base"
                    onClick={() => setEditMode(true)}
                  >
                    <HiOutlinePencil className="w-4 h-4 sm:w-5 sm:h-5" /> Edit Profile
                  </button>
                </div>
                {/* Company Name Edit Section (for company users) */}
                {user?.role === 'company' && user?.company_id && (
                  <div className="w-full flex flex-col gap-2 mb-4">
                    <label className="font-semibold text-indigo-700 dark:text-indigo-200">Company Name</label>
                    {companyEditMode ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          className="border rounded px-3 py-2 w-64"
                          disabled={companyNameLoading}
                        />
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded"
                          onClick={handleCompanyNameUpdate}
                          disabled={companyNameLoading}
                        >
                          Save
                        </button>
                        <button
                          className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
                          onClick={() => setCompanyEditMode(false)}
                          disabled={companyNameLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <span className="text-lg font-bold text-indigo-900 dark:text-white">{companyName}</span>
                        <button
                          className="bg-indigo-500 text-white px-2 py-1 rounded"
                          onClick={() => setCompanyEditMode(true)}
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
