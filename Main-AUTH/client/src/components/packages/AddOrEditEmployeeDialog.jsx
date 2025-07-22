import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPurchasedCartItems } from "../../api/cartApi";
import { addNewEmployee } from "../../api/employeeApi";
import { enqueueSnackbar } from "notistack";
import { getUserFromToken } from "../../util/jwt.pharser";

const AddEmployeeDialog = ({ open, onClose, defaultValues }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: defaultValues || {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
    }
  }, [defaultValues, reset]);

  const user = getUserFromToken();
  const email = user?.ownerEmail;
  const role = user?.role;
  console.log("defaultData", defaultValues);

  const queryClient = useQueryClient();
  const { data: purchasedItemData, isFetching: isPurchasedItemFetching } =
    useQuery({
      queryKey: ["cart-items", email, role],
      queryFn: () => getPurchasedCartItems(email, role),
      enabled: !!email && !!role,
    });

  const onSubmit = (data) => {
    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const email = localStorage.getItem("email");

    const payload = {
      ...data,
      ownerEmail: email,
    };

    addNewEmployeeMutation(payload);
    console.log("Form Submitted:", payload);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const { mutate: addNewEmployeeMutation } = useMutation({
    mutationFn: addNewEmployee,
    onSuccess: () => {
      enqueueSnackbar("Employee Added Successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["owner-employee", email] });
    },
    onError: (error) => {
      const serverMessage =
        error?.response?.data?.message || "Failed to add Employee";
      enqueueSnackbar(serverMessage, { variant: "error" });
    },
  });
  const [isActive, setIsActive] = useState(true);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4">Add New Employee</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
            className="w-full border rounded-lg px-4 py-2"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full border rounded-lg px-4 py-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}

          <select
            {...register("role", { required: "Role is required" })}
            className="w-full border rounded-lg px-4 py-2"
            defaultValue=""
            disabled={isPurchasedItemFetching}
          >
            <option value="" disabled>
              {isPurchasedItemFetching ? "Loading roles..." : "Select Role"}
            </option>
            {purchasedItemData?.map((pkg) => (
              <option key={pkg._id} value={pkg.name}>
                {pkg.name}
              </option>
            ))}
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}

          {defaultValues && (
            <div className="flex items-center gap-2 m-2">
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Need To Change the Password
              </label>
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                defaultChecked={defaultValues.isActive}
                className="w-10 h-5 m-2 rounded-full appearance-none bg-gray-300 cursor-pointer checked:bg-blue-500 relative transition-colors duration-300
                before:content-[''] before:w-5 before:h-5 before:absolute before:top-0 before:left-0 before:bg-white before:rounded-full before:shadow-md before:transition-transform before:duration-300 checked:before:translate-x-5"
              />
            </div>
          )}

          {isActive && (
            <>
              <input
                type="password"
                id="password"
                name="password"
                {...register("password", {
                  required: "Please password",
                })}
                placeholder="Password"
                className="w-full border rounded-lg px-4 py-2"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}

              <input
                type="password"
                placeholder="Confirm Password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
                className="w-full border rounded-lg px-4 py-2"
              />
            </>
          )}

          <button
            type="submit"
            className="bg-blue-600 w-full hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeDialog;
