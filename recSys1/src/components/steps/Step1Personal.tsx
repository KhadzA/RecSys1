import React from "react";
import type { FormState } from "../../types/form";

interface Props {
  state: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onChange: (field: keyof FormState, value: string) => void;
}

const Step1Personal: React.FC<Props> = ({ state, errors, onChange }) => (
  <div className="step-section active">
    <div className="section-heading">Personal Information</div>
    <div className="section-sub">
      Your basic contact and identification details.
    </div>
    <div className="grid-2">
      <div className="field">
        <label>
          First Name <span className="req">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Maria"
          value={state.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          className={errors.firstName ? "input-error" : ""}
        />
        {errors.firstName && (
          <div className="field-error">{errors.firstName}</div>
        )}
      </div>
      <div className="field">
        <label>
          Last Name <span className="req">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Santos"
          value={state.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          className={errors.lastName ? "input-error" : ""}
        />
        {errors.lastName && (
          <div className="field-error">{errors.lastName}</div>
        )}
      </div>
      <div className="field">
        <label>
          Email Address <span className="req">*</span>
        </label>
        <input
          type="email"
          placeholder="maria@email.com"
          value={state.email}
          onChange={(e) => onChange("email", e.target.value)}
          className={errors.email ? "input-error" : ""}
        />
        {errors.email && <div className="field-error">{errors.email}</div>}
      </div>
      <div className="field">
        <label>
          Phone Number <span className="req">*</span>
        </label>
        <input
          type="tel"
          placeholder="+63 912 345 6789"
          value={state.phone}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d+\s\-()]/g, "");
            onChange("phone", val);
          }}
          className={errors.phone ? "input-error" : ""}
        />
        {errors.phone && <div className="field-error">{errors.phone}</div>}
      </div>
      <div className="field col-span-2">
        <label>
          Current Address <span className="req">*</span>
        </label>
        <input
          type="text"
          placeholder="Street, Barangay, City, Province"
          value={state.address}
          onChange={(e) => onChange("address", e.target.value)}
          className={errors.address ? "input-error" : ""}
        />
        {errors.address && <div className="field-error">{errors.address}</div>}
      </div>
    </div>
  </div>
);

export default Step1Personal;
