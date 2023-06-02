import useSWR from "swr";
import axios from "axios";

type APIResponse = Pick<
  WelcomeProps,
  "officialAccount" | "userAccount" | "claimEvents"
>;
type ClaimEventResponse = APIResponse["claimEvents"];

export function useClaimEvents(specificAddress?: string) {
  let { data, ...rest } = useSWR(
    `/claim_events/${specificAddress || ""}`,
    (url) => axios.get<ClaimEventResponse | APIResponse>(url),
    {
      refreshInterval: 1000,
    }
  );

  let events: ClaimEventResponse["data"] = [];

  if ((data?.data as APIResponse)?.claimEvents) {
    events = (data?.data as APIResponse).claimEvents.data;
  } else if (Array.isArray((data?.data as any)?.data)) {
    events = (data?.data as ClaimEventResponse).data;
  }

  return {
    data: events?.map((c) => c.attributes),
    ...rest,
  };
}

export function useOfficialAccountBalance() {
  const { data, ...rest } = useSWR(
    "/claim_events",
    (url) => axios.get<APIResponse>(url),
    {
      refreshInterval: 1000,
    }
  );
  return {
    data: data?.data.officialAccount.balance || "0",
    ...rest,
  };
}

export function useUserAddressRemaining(address?: string) {
  const { data, ...rest } = useSWR(
    ["/claim_events", address],
    ([url, address]: [string, string | undefined]) =>
      axios.get<APIResponse>(url, { params: { address_hash: address } })
  );
  return {
    data: data?.data.userAccount.remaining,
    ...rest,
  };
}
