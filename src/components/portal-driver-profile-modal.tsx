"use client";

import { useEffect, useState } from "react";
import { Alert, Button, Modal } from "@/components/ui";
import { api, getApiErrorMessage } from "@/lib/api";
import type { DriverDetailRecord, DriverRecord } from "@/lib/portal-types";
import {
  driverRiskLabel,
  formatCpf,
  formatDriverCsat,
  formatPhone,
} from "@/lib/portal-types";

type Props = {
  driverId: string | null;
  driverPreview?: DriverRecord | null;
  onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export function PortalDriverProfileModal({
  driverId,
  driverPreview,
  onClose,
}: Props) {
  const [driver, setDriver] = useState<DriverDetailRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) {
      setDriver(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void api<DriverDetailRecord>(`/portal/drivers/${driverId}`)
      .then((data) => {
        if (!cancelled) setDriver(data);
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError));
          setDriver(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [driverId]);

  const profile = driver ?? driverPreview;
  const open = Boolean(driverId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={profile?.name ?? "Motorista"}
      description="Dados do motorista e reputação na plataforma."
      size="lg"
      footer={
        <Button type="button" variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      }
    >
      {loading && !profile ? (
        <p className="text-sm text-muted">Carregando perfil...</p>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}

      {profile ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow label="Telefone" value={formatPhone(profile.phone)} />
            <DetailRow label="E-mail" value={profile.email?.trim() || "—"} />
            <DetailRow label="CPF" value={formatCpf(profile.cpf)} />
            <DetailRow label="CNH" value={profile.cnhCategory ?? "—"} />
            <DetailRow label="Reputação (CSAT)" value={formatDriverCsat(profile)} />
            <DetailRow label="Grau de risco" value={driverRiskLabel(profile.riskLevel)} />
          </div>

          {driver?.vehicles?.length ? (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Veículos cadastrados</h3>
              <ul className="space-y-2">
                {driver.vehicles.map((vehicle) => (
                  <li
                    key={vehicle.id}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {vehicle.vehicleType?.name ?? "Veículo"}
                      </span>
                      {vehicle.isPrimary ? (
                        <span className="badge badge-brand">Principal</span>
                      ) : null}
                      {vehicle.hasAnttRegistration ? (
                        <span className="badge badge-success">ANTT</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-muted">
                      Placa {vehicle.plate}
                      {vehicle.bodyType?.name ? ` · ${vehicle.bodyType.name}` : ""}
                      {vehicle.brand || vehicle.model
                        ? ` · ${[vehicle.brand, vehicle.model].filter(Boolean).join(" ")}`
                        : ""}
                      {vehicle.hasAnttRegistration && vehicle.anttRntrc
                        ? ` · RNTRC ${vehicle.anttRntrc}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : loading ? null : (
            <p className="text-sm text-muted">Nenhum veículo cadastrado pelo motorista.</p>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
