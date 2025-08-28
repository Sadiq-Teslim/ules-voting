// src/pages/NominationPage.tsx
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
  imagePreviewUrl?: string; // For displaying the selected image
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
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNominationForms((forms) =>
        forms.map((form) =>
          form.id === id
            ? { ...form, imageFile: file, imagePreviewUrl: previewUrl }
            : form
        )
      );
    }
  };

  const handleRemoveImage = (id: number) => {
    setNominationForms((forms) =>
      forms.map((form) => {
        if (form.id === id && form.imagePreviewUrl) {
          URL.revokeObjectURL(form.imagePreviewUrl); // Clean up the object URL
          return { ...form, imageFile: undefined, imagePreviewUrl: undefined };
        }
        return form;
      })
    );
  };

  // const addNominationForm = () => {
  //   setNominationForms((forms) => [
  //     ...forms,
  //     {
  //       id: Date.now(),
  //       fullName: "",
  //       mainCategory: "",
  //       selectedDepartment: "",
  //       subCategory: "",
  //     },
  //   ]);
  // };

  const removeNominationForm = (id: number) => {
    setNominationForms((forms) => forms.filter((form) => form.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const [index, form] of nominationForms.entries()) {
      if (!form.fullName || !form.mainCategory || !form.subCategory) {
        alert(
          `Please fill out all required fields for Nomination #${index + 1}.`
        );
        return;
      }
      if (
        form.mainCategory === "Departmental Awards" &&
        !form.selectedDepartment
      ) {
        alert(`Please select a department for Nomination #${index + 1}.`);
        return;
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
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/nominate`, {
        nominations: nominationsData,
      });
      setStatus("success");
      setMessage("You have succesfully updated your details. Thank you.");
    } catch (err: any) {
      setStatus("error");
      setMessage(
        err.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-black">
        <div className="text-center bg-black/40 backdrop-blur-md border border-white/20 p-8 rounded-xl max-w-lg mx-auto w-full">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
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
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-lg w-full sm:w-auto"
            >
              <PlusCircle size={20} /> Update Another Nomination
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg w-full sm:w-auto border border-white/20"
            >
              <Home size={20} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full bg-black relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/nombg.png')" }}
    >
      <div className="relative z-10 w-full max-w-3xl mx-auto p-4 sm:p-8 text-white">
        <header className="text-center mb-10">
          <img
            src="/ules_dinner_banner.png"
            alt="Ules Dinner & Awards 2025"
            className="mx-auto w-full max-w-md mb-4"
          />
          <p className="text-slate-300 mt-2 text-lg">
            {/* Nominate deserving individuals for the awards. */}
            Update your nomination details below.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {nominationForms.map((form) => {
            // , index (to be added back to the front of *form after election.)
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
                className="bg-slate-900/70 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl relative shadow-lg"
              >
                <h3 className="text-lg font-semibold text-white mb-6">
                  Nomination Details
                  {/* #{index + 1} */}
                </h3>
                {nominationForms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeNominationForm(form.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-400 p-1 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <div
                  className="grid grid-cols-1 
                 
                 gap-x-6 gap-y-4"
                >
                  {/* sm:grid-cols-2 */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={(e) => handleInputChange(form.id, e)}
                      required
                      className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">
                      Popular Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="popularName"
                      value={form.popularName}
                      onChange={(e) => handleInputChange(form.id, e)}
                      className="w-full bg-black/30 border border-white/20 rounded-md p-2.5 text-white focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none"
                    />
                  </div> */}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-slate-300">
                      Category *
                    </label>
                    <select
                      name="mainCategory"
                      value={form.mainCategory}
                      onChange={(e) => handleInputChange(form.id, e)}
                      required
                      className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
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
                      <label className="block text-sm font-medium mb-1 text-slate-300">
                        Department *
                      </label>
                      <select
                        name="selectedDepartment"
                        value={form.selectedDepartment}
                        onChange={(e) => handleInputChange(form.id, e)}
                        required
                        className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
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
                    <label className="block text-sm font-medium mb-1 text-slate-300">
                      Award *
                    </label>
                    <select
                      name="subCategory"
                      value={form.subCategory}
                      onChange={(e) => handleInputChange(form.id, e)}
                      required
                      disabled={subCategoryOptions.length === 0}
                      className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none disabled:bg-black/20 disabled:cursor-not-allowed"
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
                  <label className="block text-sm font-medium mb-1 text-slate-300">
                    Picture *
                  </label>

                  {form.imagePreviewUrl ? (
                    // Show preview if an image is selected
                    <div className="mt-2 flex justify-center rounded-lg border border-white/30 px-6 py-8">
                      <div className="relative text-center">
                        <img
                          src={form.imagePreviewUrl}
                          alt="Nominee preview"
                          className="mx-auto h-32 w-32 object-cover rounded-full border-2 border-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(form.id)}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5"
                          aria-label="Remove image"
                        >
                          <Trash2 size={16} />
                        </button>
                        <p className="text-xs text-slate-400 mt-2 truncate max-w-xs mx-auto">
                          {form.imageFile?.name}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // --- UPDATE: The entire upload box is now a clickable label ---
                    <label
                      htmlFor={`file-upload-${form.id}`}
                      className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/30 px-6 py-8 text-center transition-colors hover:border-white/50 hover:bg-white/5"
                    >
                      <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                      <div className="mt-4 flex text-sm justify-center">
                        <span className="font-semibold text-gray-300">
                          Upload a file
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG up to 5MB (Required)
                      </p>
                      <input
                        id={`file-upload-${form.id}`}
                        type="file"
                        className="sr-only"
                        onChange={(e) => handleFileChange(form.id, e)}
                        accept="image/png, image/jpeg"
                        required
                      />
                    </label>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pt-6 border-t border-white/20 flex flex-col-reverse gap-4">
            {/* sm:flex-row sm:justify-between sm:items-center  */}
            {/* <button
                type="button"
                onClick={addNominationForm}
                className="flex items-center justify-center gap-2 text-gray-300 font-semibold hover:text-white transition-colors py-2"
              >
                <PlusCircle size={20} /> Add Another Nomination
              </button> */}
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-lg disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-wait w-full sm:w-auto transition-colors"
            >
              {status === "loading" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              {status === "loading" ? "Submitting..." : "Submit Nominations"}
            </button>
          </div>

          {status === "loading" && (
            <p className="text-slate-300 text-sm text-center animate-pulse">
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
