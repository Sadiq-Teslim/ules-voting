/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "wouter";
import { Send, Loader2, CheckCircle, UploadCloud } from "lucide-react";

interface Category {
  id: string;
  title: string;
}

const NominationPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    matricNumber: "",
    category: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.title = "ULES Awards | Self-Nomination";
    axios
      .get("/nominees.json")
      .then((res) => setCategories(res.data.categories));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage("Please upload a profile picture.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("Uploading image...");

    try {
      // 1. Upload image to Cloudinary
      const imageUploadData = new FormData();
      imageUploadData.append("file", imageFile);
      imageUploadData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        imageUploadData
      );
      const imageUrl = cloudinaryRes.data.secure_url;
      setMessage("Submitting nomination...");

      // 2. Submit form data to your backend
      const apiData = { ...formData, imageUrl };
      const backendRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/nominate`,
        apiData
      );

      setStatus("success");
      setMessage(backendRes.data.message);
    } catch (err: any) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="text-center bg-slate-800 p-8 rounded-lg max-w-lg mx-auto">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white">
          Submission Successful!
        </h1>
        <p className="text-slate-300 mt-2">{message}</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 text-white">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold">Nominee Submission Form</h1>
        <p className="text-slate-400 mt-2">
          Nominate yourself for an award category. Submissions will be reviewed
          by the committee.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-lg space-y-6 border border-slate-700"
      >
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            onChange={handleInputChange}
            required
            className="w-full bg-slate-700 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Matriculation Number
          </label>
          <input
            type="text"
            name="matricNumber"
            maxLength={9}
            onChange={handleInputChange}
            required
            className="w-full bg-slate-700 rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Award Category
          </label>
          <select
            name="category"
            onChange={handleInputChange}
            required
            className="w-full bg-slate-700 rounded-md p-2"
          >
            <option value="">-- Select a Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Profile Picture
          </label>
          <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-10">
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-slate-500" />
              <div className="mt-4 flex text-sm leading-6 text-slate-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-cyan-400 focus-within:outline-none hover:text-cyan-300"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {imageFile ? imageFile.name : "PNG, JPG up to 10MB"}
              </p>
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full flex items-center justify-center gap-2 bg-cyan-500 font-bold py-3 rounded-lg disabled:bg-slate-600"
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send />
          )}
          {status === "loading" ? message : "Submit Nomination"}
        </button>
        {status === "error" && (
          <p className="text-red-400 text-sm text-center">{message}</p>
        )}
      </form>
    </div>
  );
};

export default NominationPage;
