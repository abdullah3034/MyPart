import axios from "axios";

export const addNewEmployee = async (employee) => {
  console.log("hi" + employee);
  const res = await axios.post(
    `http://localhost:5000/api/auth/register`,
    employee
  );
  return res.data;
};

export const fetchEmployeeList = async (email) => {
  console.log("hi" + email);
  const res = await axios.get(
    `http://localhost:5000/api/user/${email}/owner-employee`
  );
  return res.data;
};