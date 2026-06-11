import { API_PUSHER_AUTH } from "@/constant/constant";
import PusherClient from "pusher-js";

let pusherClient;

if (typeof window !== "undefined") {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        authEndpoint: API_PUSHER_AUTH, 
    });
}

export { pusherClient };