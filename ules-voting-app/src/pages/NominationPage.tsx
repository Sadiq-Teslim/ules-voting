/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "wouter";
import {
  Send,
  Loader2,
  CheckCircle,
  UploadCloud,
  PlusCircle,
  Trash2,
  Home,
} from "lucide-react";

// --- TypeScript Types ---
interface SubCategory {
  id: string;
  title: string;
}
interface StructuredCategories {
  "Undergraduate Awards": SubCategory[];
  "General Awards": SubCategory[];
  "Finalist Awards": SubCategory[];
}
interface DepartmentData {
  id: string;
  title: string;
  subcategories: SubCategory[];
}
interface NominationFormState {
  id: number;
  fullName: string;
  popularName?: string;
  mainCategory: string;
  selectedDepartment: string;
  subCategory: string;
  imageFile?: File;
}

const NominationPage = () => {
  const [categories, setCategories] = useState<StructuredCategories | null>(
    null
  );
  const [departmentsData, setDepartmentsData] = useState<DepartmentData[]>([]);
  const [nominationForms, setNominationForms] = useState<NominationFormState[]>(
    [
      {
        id: Date.now(),
        fullName: "",
        mainCategory: "",
        selectedDepartment: "",
        subCategory: "",
      },
    ]
  );
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  // --- Data fetching logic is unchanged and correct ---
  useEffect(() => {
    document.title = "ULES Awards | Nomination";
    axios.get("/nominees.json").then((res) => {
      const jsonData = res.data;
      const mainCats: StructuredCategories = {
        "Undergraduate Awards": [],
        "General Awards": [],
        "Finalist Awards": [],
      };
      jsonData.categories.forEach((cat: SubCategory) => {
        if (cat.id.startsWith("ug-"))
          mainCats["Undergraduate Awards"].push(cat);
        else if (cat.id.startsWith("gen-"))
          mainCats["General Awards"].push(cat);
        else if (cat.id.startsWith("fin-"))
          mainCats["Finalist Awards"].push(cat);
      });
      const deptData: DepartmentData[] = jsonData.departments.map(
        (dept: any) => ({
          id: dept.id,
          title: dept.title.replace("Departmental Awards - ", ""),
          subcategories: dept.subcategories,
        })
      );
      setCategories(mainCats);
      setDepartmentsData(deptData);
    });
  }, []);

  const handleInputChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNominationForms((forms) =>
      forms.map((form) => {
        if (form.id === id) {
          if (name === "mainCategory")
            return {
              ...form,
              [name]: value,
              selectedDepartment: "",
              subCategory: "",
            };
          if (name === "selectedDepartment")
            return { ...form, [name]: value, subCategory: "" };
          return { ...form, [name]: value };
        }
        return form;
      })
    );
  };
  const handleFileChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.[0]) {
      setNominationForms((forms) =>
        forms.map((form) =>
          form.id === id ? { ...form, imageFile: e.target.files[0] } : form
        )
      );
    }
  };
  const addNominationForm = () => {
    setNominationForms((forms) => [
      ...forms,
      {
        id: Date.now(),
        fullName: "",
        mainCategory: "",
        selectedDepartment: "",
        subCategory: "",
      },
    ]);
  };
  const removeNominationForm = (id: number) => {
    setNominationForms((forms) => forms.filter((form) => form.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- CRITICAL FIX: Add validation before submitting ---
    for (const [index, form] of nominationForms.entries()) {
      if (!form.fullName || !form.mainCategory || !form.subCategory) {
        alert(
          `Please fill out all required fields for Nomination #${index + 1}.`
        );
        return; // Stop the submission
      }
      if (
        form.mainCategory === "Departmental Awards" &&
        !form.selectedDepartment
      ) {
        alert(`Please select a department for Nomination #${index + 1}.`);
        return; // Stop the submission
      }
    }

    setStatus("loading");
    setMessage("Preparing nominations...");
    try {
      const nominationsData = await Promise.all(
        nominationForms.map(async (form) => {
          let imageUrl;
          if (form.imageFile) {
            setMessage(`Uploading image for ${form.fullName || "nominee"}...`);
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
            category: form.subCategory,
            imageUrl,
          };
        })
      );
      setMessage("Finalizing submission...");
      const backendRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/nominate`,
        { nominations: nominationsData }
      );

      // This part will now be reached correctly
      setStatus("success");
      setMessage(
        backendRes.data.message ||
          "Your nomination has been submitted for review."
      );
    } catch (err: any) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
        <div className="text-center bg-slate-800 p-8 rounded-lg max-w-lg mx-auto border border-slate-700 w-full">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">
            Submission Successful!
          </h1>
          <p className="text-slate-300 mt-2">{message}</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setNominationForms([
                  {
                    id: Date.now(),
                    fullName: "",
                    mainCategory: "",
                    selectedDepartment: "",
                    subCategory: "",
                  },
                ]);
                setStatus("idle");
              }}
              className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-6 rounded-lg w-full sm:w-auto"
            >
              <PlusCircle size={20} /> Submit Another
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-3 px-6 rounded-lg w-full sm:w-auto"
            >
              <Home size={20} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-900 text-white">
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-8">
        <header className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full shadow-lg filter drop-shadow-[0_0_8px_rgba(0,220,255,0.4)]">
              <img
                src="/nobgules-logo.png"
                alt="ULES Logo"
                className="w-16 h-16"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ULES 24/25 DINNER NOMINATIONS
          </h1>
          <p className="text-slate-400 mt-2">
            Nominate deserving individuals. Submissions are subject to review.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {nominationForms.map((form, index) => {
            let subCategoryOptions: SubCategory[] = [];
            if (form.mainCategory && categories) {
              if (form.mainCategory === "Departmental Awards") {
                if (form.selectedDepartment) {
                  const dept = departmentsData.find(
                    (d) => d.id === form.selectedDepartment
                  );
                  if (dept) subCategoryOptions = dept.subcategories;
                }
              } else {
                subCategoryOptions =
                  categories[form.mainCategory as keyof StructuredCategories];
              }
            }

            return (
              <div
                key={form.id}
                className="bg-slate-800 p-6 rounded-lg border border-slate-700 relative"
              >
                <h3 className="text-lg font-semibold text-cyan-400 mb-6">
                  Nomination #{index + 1}
                </h3>
                {nominationForms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNominationForm(form.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-500 p-1 rounded-full transition-colors"
                    aria-label="Remove nomination"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
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
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Main Category *
                    </label>
                    <select
                      name="mainCategory"
                      value={form.mainCategory}
                      onChange={(e) => handleInputChange(form.id, e)}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                    >
                      <option value="">-- Select --</option>
                      {categories &&
                        Object.keys(categories).map((catName) => (
                          <option key={catName} value={catName}>
                            {catName}
                          </option>
                        ))}
                      {departmentsData.length > 0 && (
                        <option value="Departmental Awards">
                          Departmental Awards
                        </option>
                      )}
                    </select>
                  </div>

                  {form.mainCategory === "Departmental Awards" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Department *
                      </label>
                      <select
                        name="selectedDepartment"
                        value={form.selectedDepartment}
                        onChange={(e) => handleInputChange(form.id, e)}
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                      >
                        <option value="">-- Select Department --</option>
                        {departmentsData.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Specific Award *
                    </label>
                    <select
                      name="subCategory"
                      value={form.subCategory}
                      onChange={(e) => handleInputChange(form.id, e)}
                      required
                      disabled={subCategoryOptions.length === 0}
                      className="w-full bg-slate-700 border border-slate-600 rounded p-2 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:bg-slate-800 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Select Above First --</option>
                      {subCategoryOptions.map((subCat) => (
                        <option key={subCat.id} value={subCat.id}>
                          {subCat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Profile Picture (Optional)
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-600 px-6 py-8">
                    <div className="text-center">
                      <UploadCloud className="mx-auto h-10 w-10 text-slate-500" />
                      <div className="mt-4 flex text-sm justify-center">
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
                            accept="image/png, image/jpeg"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-xs mx-auto">
                        {form.imageFile
                          ? form.imageFile.name
                          : "PNG, JPG up to 5MB"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-6 border-t border-slate-700 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
            <button
              type="button"
              onClick={addNominationForm}
              className="flex items-center justify-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors py-2"
            >
              <PlusCircle size={20} /> Add Another Nomination
            </button>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-6 rounded-lg disabled:bg-slate-600 disabled:cursor-wait w-full sm:w-auto transition-colors"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              {status === "loading"
                ? "Submitting..."
                : "Submit All Nominations"}
            </button>
          </div>

          {status === "loading" && (
            <p className="text-cyan-300 text-sm text-center animate-pulse">
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-sm text-center p-3 bg-red-500/10 rounded-md">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default NominationPage;
