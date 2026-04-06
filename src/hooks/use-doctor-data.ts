import { useMemo } from "react"
import { useUserList } from "./use-user"

export function useDoctorData(doctorId: number | undefined) {
  const { data: usersData } = useUserList({ per_page: 1000 })

  return useMemo(() => {
    if (!doctorId) return null
    const allUsers = usersData?.data || []
    const doctors = allUsers.filter((u) =>
      u.roles?.some((r) => {
        const roleName = r.name?.toLowerCase() || ""
        return roleName === "dokter" || roleName === "doctor"
      })
    )
    return doctors.find((d) => d.id === doctorId) || null
  }, [doctorId, usersData?.data])
}
