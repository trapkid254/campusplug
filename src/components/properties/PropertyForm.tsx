"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { PROPERTY_TYPES, parseAmenities } from "@/lib/utils";

type University = { id: string; name: string };

type PropertyData = {
  id?: string;
  title: string;
  propertyType: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  monthlyRent: number;
  depositAmount: number;
  furnished: boolean;
  genderSpecific?: string | null;
  amenities: string;
  availability: string;
  contactPhone: string;
  whatsappNumber?: string | null;
  universityId?: string | null;
  images?: { url: string }[];
};

export function PropertyForm({
  universities,
  initial,
}: {
  universities: University[];
  initial?: PropertyData;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const amenityList = initial ? parseAmenities(initial.amenities) : [];
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    initial?.images?.map((i) => i.url) || []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const amenities = (form.get("amenities") as string)
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const payload = {
      title: form.get("title"),
      propertyType: form.get("propertyType"),
      description: form.get("description"),
      location: form.get("location"),
      latitude: form.get("latitude") || null,
      longitude: form.get("longitude") || null,
      monthlyRent: form.get("monthlyRent"),
      depositAmount: form.get("depositAmount") || 0,
      furnished: form.get("furnished") === "true",
      genderSpecific: form.get("genderSpecific") || null,
      amenities,
      availability: form.get("availability"),
      contactPhone: form.get("contactPhone"),
      whatsappNumber: form.get("whatsappNumber") || form.get("contactPhone"),
      universityId: form.get("universityId") || null,
      imageUrls: uploadedImages,
    };

    const url = initial?.id ? `/api/properties/${initial.id}` : "/api/properties";
    const method = initial?.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push("/dashboard/landlord");
      router.refresh();
    } else {
      setError(data.error || "Failed to save property");
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          name="title"
          label="Property Title"
          required
          defaultValue={initial?.title}
          placeholder="e.g. Modern Hostel Near UoN"
        />

        <Select
          name="propertyType"
          label="Property Type"
          required
          defaultValue={initial?.propertyType || "HOSTEL"}
          options={[...PROPERTY_TYPES]}
        />

        <Textarea
          name="description"
          label="Description"
          required
          defaultValue={initial?.description}
          placeholder="Describe the property, rules, nearby amenities..."
        />

        <Input
          name="location"
          label="Location / Address"
          required
          defaultValue={initial?.location}
          placeholder="e.g. Kahawa Wendani, Thika Road"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="latitude"
            label="Latitude (for map)"
            type="number"
            step="any"
            defaultValue={initial?.latitude ?? ""}
            placeholder="-1.2797"
          />
          <Input
            name="longitude"
            label="Longitude (for map)"
            type="number"
            step="any"
            defaultValue={initial?.longitude ?? ""}
            placeholder="36.8172"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="monthlyRent"
            label="Monthly Rent (KES)"
            type="number"
            required
            defaultValue={initial?.monthlyRent}
            placeholder="8500"
          />
          <Input
            name="depositAmount"
            label="Deposit (KES)"
            type="number"
            defaultValue={initial?.depositAmount ?? 0}
            placeholder="5000"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="furnished"
            label="Furnished"
            defaultValue={initial?.furnished ? "true" : "false"}
            options={[
              { value: "false", label: "Unfurnished" },
              { value: "true", label: "Furnished" },
            ]}
          />
          <Select
            name="genderSpecific"
            label="Gender"
            defaultValue={initial?.genderSpecific || ""}
            options={[
              { value: "", label: "Any / Mixed" },
              { value: "Male", label: "Male Only" },
              { value: "Female", label: "Female Only" },
              { value: "Mixed", label: "Mixed" },
            ]}
          />
        </div>

        <Select
          name="availability"
          label="Availability"
          defaultValue={initial?.availability || "AVAILABLE"}
          options={[
            { value: "AVAILABLE", label: "Available" },
            { value: "OCCUPIED", label: "Occupied" },
            { value: "COMING_SOON", label: "Coming Soon" },
          ]}
        />

        <Select
          name="universityId"
          label="Nearest University"
          defaultValue={initial?.universityId || ""}
          options={[
            { value: "", label: "Select university..." },
            ...universities.map((u) => ({ value: u.id, label: u.name })),
          ]}
        />

        <Input
          name="amenities"
          label="Amenities (comma-separated)"
          defaultValue={amenityList.join(", ")}
          placeholder="WiFi, Security, Water, Parking"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="contactPhone"
            label="Contact Phone"
            required
            defaultValue={initial?.contactPhone}
            placeholder="0712345678"
          />
          <Input
            name="whatsappNumber"
            label="WhatsApp Number"
            defaultValue={initial?.whatsappNumber || ""}
            placeholder="Same as phone if blank"
          />
        </div>

        <ImageUpload images={uploadedImages} onChange={setUploadedImages} maxImages={6} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : initial?.id ? "Update Listing" : "Submit for Approval"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>

        {!initial?.id && (
          <p className="text-xs text-slate-500">
            Listings are reviewed by admin before going live on the platform.
          </p>
        )}
        {initial?.id && (
          <p className="text-xs text-amber-600">
            Updates may require admin re-approval before appearing on the site.
          </p>
        )}
      </form>
    </Card>
  );
}
