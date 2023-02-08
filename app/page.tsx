"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({ inviteCode: "" });
  const [error, setError] = useState<null | string>(null);
  const [success, setSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    if (showAlert) {
      const timeout = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [showAlert]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowAlert(false);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setShowAlert(true);

      if (res.status === 401) {
        setError("Invite code is invalid");
      } else if (res.status === 200) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(`Something went wrong: ${err.message}`);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main>
      {showAlert && success && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-success">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Authorized</span>
            </div>
          </div>
        </div>
      )}

      {showAlert && error && (
        <div className="toast toast-top toast-end">
          <div className="alert alert-error">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Invalid invite code</span>
            </div>
          </div>
        </div>
      )}
      <video
        className="absolute top-56 md:top-64 lg:top-60 w-full h-auto min-h-screen object-cover opacity-60 z-0"
        autoPlay
        muted
        loop
      >
        <source src="assets/bg_av1.mp4" type="video/mp4" />
        <source src="assets/bg.webm" type="video/webm" />
        <source src="assets/bg.mp4" type="video/mp4" />
      </video>
      <div className="flex items-center justify-center h-screen bg-base-300 bg-gradient-to-bg-primary from-bottom-75 z-10 relative bg-opacity-0">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl">
            <span className="underline underline-offset-3 decoration-8 decoration-primary">
              Anonymous
              <br />
            </span>{" "}
            email forwarding
            <br />
            service
          </h1>
          <form onSubmit={handleSubmit} className="form-control">
            <div className="input-group flex justify-center">
              <input
                type="text"
                placeholder="Invite Code"
                className="input input-bordered w-36"
                name="inviteCode"
                onChange={handleInputChange}
              />
              <button className="btn btn-primary btn-square text-white">
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
