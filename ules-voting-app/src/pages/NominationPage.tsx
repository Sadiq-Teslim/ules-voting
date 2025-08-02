/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { Link } from "wouter";
import {
  Send,
  Loader2,
  // CheckCircle,
  UploadCloud,
  Trophy,
  PlusCircle,
  Trash2,
} from "lucide-react";

interface Category {
  id: string;
  title: string;
}
interface NominationFormState {
  id: number;
  fullName: string;
  popularName?: string;
  category: string;
  imageFile?: File;
}

const NominationPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [nominationForms, setNominationForms] = useState<NominationFormState[]>(
    [{ id: Date.now(), fullName: "", category: "" }]
  );
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
  document.title = "ULES Awards | Nomination";
  axios
    .get("/nominees.json")
    .then((res) => setCategories(res.data.categories));
}, []);

  const handleInputChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNominationForms((forms) =>
      forms.map((form) =>
        form.id === id ? { ...form, [e.target.name]: e.target.value } : form
      )
    );
  };
  const handleFileChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0])
      setNominationForms((forms) =>
        forms.map((form) =>
          form.id === id ? { ...form, imageFile: e.target.files[0] } : form
        )
      );
  };
  const addNominationForm = () =>
    setNominationForms((forms) => [
      ...forms,
      { id: Date.now(), fullName: "", category: "" },
    ]);
  const removeNominationForm = (id: number) =>
    setNominationForms((forms) => forms.filter((form) => form.id !== id));
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("Processing...");
    try {
      const nominationsData = await Promise.all(
        nominationForms.map(async (form) => {
          let imageUrl;
          if (form.imageFile) {
            setMessage("Uploading images...");
            const formData = new FormData();
            formData.append("file", form.imageFile);
            formData.append(
              "upload_preset",
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
            );
            const res = await axios.post(
              `https://api.cloudinary.com/v1_1/${
                import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
              }/image/upload`,
              formData
            );
            imageUrl = res.data.secure_url;
          }
          return {
            fullName: form.fullName,
            popularName: form.popularName || "",
            category: form.category,
            imageUrl,
          };
        })
      );
      setMessage("Submitting nominations...");
      const backendRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/nominate`,
        { nominations: nominationsData }
      );
      setStatus("success");
      setMessage(backendRes.data.message);
    } catch (err: any) {
      setStatus("error");
      if (err.code === "ERR_NETWORK") {
        setMessage(
          "Connection failed. Please check your network or try again later."
        );
      } else {
        setMessage(
          err.response?.data?.message || "An unexpected error occurred."
        );
      }
    }
  };

  if (status === "success") {
    /* Return your success JSX here */
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 text-white">
      <header className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          ULES Awards Nomination
        </h1>
        <p className="text-slate-400 mt-2">
          Nominate deserving individuals. Submissions are subject to review.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-8">
        {nominationForms.map((form, index) => (
          <div
            key={form.id}
            className="bg-slate-800 p-6 rounded-lg border border-slate-700 relative"
          >
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">
              Nomination #{index + 1}
            </h3>
            {nominationForms.length > 1 && (
              <button
                type="button"
                onClick={() => removeNominationForm(form.id)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={(e) => handleInputChange(form.id, e)}
                  required
                  className="w-full bg-slate-700 rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Popular Name (Optional)
                </label>
                <input
                  type="text"
                  name="popularName"
                  value={form.popularName}
                  onChange={(e) => handleInputChange(form.id, e)}
                  className="w-full bg-slate-700 rounded p-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Award Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => handleInputChange(form.id, e)}
                required
                className="w-full bg-slate-700 rounded p-2"
              >
                <option value="">-- Select --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Profile Picture (Optional)
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-8">
                <div className="text-center">
                  <UploadCloud className="mx-auto h-10 w-10 text-slate-500" />
                  <div className="mt-4 flex text-sm">
                    <label
                      htmlFor={`file-upload-${form.id}`}
                      className="cursor-pointer font-semibold text-cyan-400 hover:text-cyan-300"
                    >
                      <span>Upload a file</span>
                      <input
                        id={`file-upload-${form.id}`}
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleFileChange(form.id, e)}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    {form.imageFile ? form.imageFile.name : "PNG, JPG"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
          <button
            type="button"
            onClick={addNominationForm}
            className="flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300"
          >
            <PlusCircle size={20} /> Add Another Nomination
          </button>
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center gap-2 bg-cyan-500 font-bold py-3 px-6 rounded-lg disabled:bg-slate-600"
          >
            {status === "loading" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            {status === "loading" ? message : "Submit All Nominations"}
          </button>
        </div>
        {status === "error" && (
          <p className="text-red-400 text-sm text-center">{message}</p>
        )}
      </form>
    </div>
  );
};
export default NominationPage;
