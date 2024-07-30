import { useEffect, useState } from "react";

export default function UseProfile() {
  const [data, setData_] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch("/api/profile").then((response) => {
      response.json().then((data) => {
        setData_(data.admin);
        setLoading(false);
      });
    });
  }, []);

  return { loading, data };
}
