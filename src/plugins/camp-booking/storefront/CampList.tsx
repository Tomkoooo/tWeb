import Link from "next/link"
import { CampService } from "../services/camp-service"

export async function CampList() {
  const camps = await CampService.listPublishedCampsWithSessions()

  if (camps.length === 0) {
    return (
      <p className="font-minecraft-body text-center text-lg text-[#3d2817] py-16">
        Hamarosan indulnak az új turnusok — nézz vissza később!
      </p>
    )
  }

  return (
    <div id="taborok" className="space-y-12">
      {camps.map((camp) => (
        <section key={camp.id} className="minecraft-panel p-6 md:p-8">
          <h2 className="font-minecraft text-xl md:text-2xl text-[#2d5016] mb-2">{camp.title}</h2>
          {camp.description ? (
            <p className="font-minecraft-body text-[#3d2817] mb-6 max-w-2xl">{camp.description}</p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {camp.sessions.map((session) => (
              <article
                key={session.id}
                className="minecraft-panel-inner p-4 flex flex-col gap-3"
              >
                <div>
                  <h3 className="font-minecraft text-sm text-[#1a3d5c]">{session.label}</h3>
                  <p className="font-minecraft-body text-xs text-[#5c4a32] mt-1">
                    {session.sessionLabel}
                  </p>
                </div>
                <p className="font-minecraft-body text-sm">
                  <span className="font-semibold">{session.spotsLeft}</span> szabad hely /{" "}
                  {session.capacity}
                </p>
                {session.ticketTypes.length > 0 ? (
                  <ul className="font-minecraft-body text-xs space-y-1 text-[#3d2817]">
                    {session.ticketTypes.map((tt) => (
                      <li key={tt.id}>
                        {tt.name}: {tt.priceHuf.toLocaleString("hu-HU")} Ft
                        {tt.pricingMode === "per_child" ? " / gyerek" : " / foglalás"}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <Link
                  href={`/foglalas/${session.id}`}
                  className={`minecraft-btn mt-auto text-center ${
                    session.spotsLeft < 1 ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  {session.spotsLeft < 1 ? "Betelt" : "Foglalás"}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
