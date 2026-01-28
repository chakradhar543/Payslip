import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "../assets/company-logo.png";

export default function PayslipCTC() {
  const pdfRef = useRef();

  const [data, setData] = useState({
    name: "",
    payslipFor: "",
    designation: "",
    ctc: "",
    associateId: "",
    joinDate: "",
    location: "",
    department: "",
    daysPayable: 30,
    lopDays: 0,
    address: "",
    gst: "",
    uan: "",
  });

  const [variablePayEnabled, setVariablePayEnabled] = useState(false);
  const [variablePayAmount, setVariablePayAmount] = useState(0);

  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);

  const [uanEnabled, setUanEnabled] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  /* ===== HELPERS ===== */
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const formatINR = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ===== CALCULATIONS ===== */
  const annualCTC = Number(data.ctc || 0);
  const monthlyCTC = annualCTC / 12;

  const basic = monthlyCTC * 0.5;
  const hra = basic * 0.4;
  const special = monthlyCTC - (basic + hra);

  const variablePay = variablePayEnabled ? Number(variablePayAmount) : 0;
  const bonus = bonusEnabled ? Number(bonusAmount) : 0;

  const pfEmployee = 1800;
  const pfEmployer = 1800;
  const profTax = 200;

  const grossEarnings = basic + hra + special + bonus;

  const perDaySalary = grossEarnings / data.daysPayable;
  const lopDeduction = perDaySalary * Number(data.lopDays || 0);

  const grossDeductions =
    pfEmployee + pfEmployer + profTax + lopDeduction + variablePay;

  const netSalary = grossEarnings - grossDeductions;

  /* ===== PDF ===== */
  const downloadPDF = async () => {
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save("Payslip.pdf");
  };

  return (
    <div className="container my-4">
      <h4>CTC Payslip Generator</h4>

      {/* ===== FORM ===== */}
      <div className="row g-3 mb-4">
        {[
          ["name", "Name"],
          ["payslipFor", "Payslip For"],
          ["designation", "Designation"],
          ["ctc", "Annual CTC"],
          ["associateId", "Associate ID"],
          ["joinDate", "Join Date"],
          ["location", "Location"],
          ["department", "Department"],
          ["daysPayable", "Days Payable"],
          ["daysWorked", "Days Worked"],
          ["lopDays", "LOP Days"],
          ["address", "Address"],
          ["gst", "GST"],
        ].map(([key, label]) => (
          <div className="col-md-3" key={key}>
            <label>{label}</label>
            <input
              type={key === "joinDate" ? "date" : "text"}
              name={key}
              className="form-control"
              value={data[key]}
              onChange={handleChange}
            />
          </div>
        ))}

        {/* Variable Pay */}
        <div className="col-md-3">
          <label>Variable Pay</label>
          <select
            className="form-control"
            onChange={(e) => setVariablePayEnabled(e.target.value === "yes")}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {variablePayEnabled && (
          <div className="col-md-3">
            <label>Variable Pay Amount</label>
            <input
              type="number"
              className="form-control"
              onChange={(e) => setVariablePayAmount(e.target.value)}
            />
          </div>
        )}

        {/* Bonus */}
        <div className="col-md-3">
          <label>Bonus</label>
          <select
            className="form-control"
            onChange={(e) => setBonusEnabled(e.target.value === "yes")}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {bonusEnabled && (
          <div className="col-md-3">
            <label>Bonus Amount</label>
            <input
              type="number"
              className="form-control"
              onChange={(e) => setBonusAmount(e.target.value)}
            />
          </div>
        )}

        {/* UAN */}
        <div className="col-md-3">
          <label>UAN</label>
          <select
            className="form-control"
            onChange={(e) => setUanEnabled(e.target.value === "yes")}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {uanEnabled && (
          <div className="col-md-3">
            <label>UAN Number</label>
            <input
              type="text"
              name="uan"
              className="form-control"
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <button
        className="btn btn-success mb-3"
        onClick={() => setConfirmed(true)}
      >
        Submit
      </button>

      {/* ===== PAYSLIP ===== */}
      {confirmed && (
        <div ref={pdfRef} className="a4-page">
          {/* LOGO – TOP CENTER */}
          <div className="payslip-logo-center">
            <img src={logo} alt="logo" />
          </div>

          <table className="details-table">
            <tbody>
              <tr>
                <td className="label">Payslip For</td><td className="colon">:</td><td className="value">{data.payslipFor}</td>
                <td className="v-divider"></td>
                <td className="label">Name</td><td className="colon">:</td><td className="value">{data.name}</td>
              </tr>

              <tr>
                <td className="label">Associate ID</td><td className="colon">:</td><td className="value">{data.associateId}</td>
                <td className="v-divider"></td>
                <td className="label">Designation</td><td className="colon">:</td><td className="value">{data.designation}</td>
              </tr>

              <tr>
                <td className="label">Location</td><td className="colon">:</td><td className="value">{data.location}</td>
                <td className="v-divider"></td>
                <td className="label">Department</td><td className="colon">:</td><td className="value">{data.department}</td>
              </tr>

              <tr>
                <td className="label">Join Date</td><td className="colon">:</td><td className="value">{formatDate(data.joinDate)}</td>
                <td className="v-divider"></td>
                <td className="label">Days Payable</td><td className="colon">:</td><td className="value">{data.daysPayable}</td>
              </tr>

              {uanEnabled && (
                <tr>
                  <td className="label">UAN</td><td className="colon">:</td><td className="value">{data.uan}</td>
                  <td className="v-divider"></td>
                  <td></td><td></td><td></td>
                </tr>
              )}
            </tbody>
          </table>

          <table className="salary-final">
            <thead>
              <tr>
                <th>EARNINGS</th>
                <th>AMOUNT (₹)</th>
                <th className="v-divider"></th>
                <th>DEDUCTIONS</th>
                <th>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Basic</td><td>{formatINR(basic)}</td><td className="v-divider"></td><td>PF Employee</td><td>{formatINR(pfEmployee)}</td></tr>
              <tr><td>HRA</td><td>{formatINR(hra)}</td><td className="v-divider"></td><td>Professional Tax</td><td>{formatINR(profTax)}</td></tr>
              <tr><td>Special Allowance</td><td>{formatINR(special)}</td><td className="v-divider"></td><td>LOP Deduction</td><td>{formatINR(lopDeduction)}</td></tr>

              {(variablePayEnabled || bonusEnabled) && (
                <tr>
                  {/* LEFT SIDE – Bonus */}
                  <td>{bonusEnabled ? "Bonus" : ""}</td>
                  <td>{bonusEnabled ? formatINR(bonus) : ""}</td>
                  <td className="v-divider"></td>
                  {/* RIGHT SIDE – Variable Pay */}
                  <td>{variablePayEnabled ? "Variable Pay" : ""}</td>
                  <td>{variablePayEnabled ? formatINR(variablePay) : ""}</td>
                </tr>
              )}
              <tr className="total-row">
                <td>Total</td><td>{formatINR(grossEarnings)}</td>
                <td className="v-divider"></td>
                <td>Total</td><td>{formatINR(grossDeductions)}</td>
              </tr>
            </tbody>
          </table>

          <div className="net-salary">
            Net Salary / Month : ₹{formatINR(netSalary)}
          </div>

          <div className="footer">
            <b>UXINTERFACELY IT Solution</b><br />
            {data.address}<br />
            GSTIN: {data.gst}<br />
            <i>This is a computer-generated payslip.</i>
          </div>
        </div>
      )}

      {confirmed && (
        <button className="btn btn-primary mt-3" onClick={downloadPDF}>
          Download PDF
        </button>
      )}
    </div>
  );
}
