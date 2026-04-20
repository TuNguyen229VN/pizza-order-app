import { API_PROFILE } from "@/constant/constant";
import { useEffect, useState } from "react";

export default function UseProfile() {
  const [data, setData_] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(API_PROFILE).then((response) => {
      response.json().then((data) => {
        setData_(data);
        setLoading(false);
      });
    });
  }, []);

  return { loading, data };
}
