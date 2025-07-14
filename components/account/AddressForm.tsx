"use client";

// --- 1. IMPORTS (diasumsikan ada di setiap file yang membutuhkannya) ---
import { useState, useEffect, FormEvent } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { Address, RajaOngkirItem } from "@/lib/types/profile";

export const AddressForm = ({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: Address | null;
  onSuccess: (newAddress: Address) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    label: initialData?.label || "",
    recipient_name: initialData?.recipient_name || "",
    phone_number: initialData?.phone_number || "",
    province_id: initialData?.province_id?.toString() || "",
    province_name: initialData?.province_name || "",
    city_id: initialData?.city_id?.toString() || "",
    city_name: initialData?.city_name || "",
    district_id: initialData?.district_id?.toString() || "",
    district_name: initialData?.district_name || "",
    subdistrict_id: initialData?.subdistrict_id?.toString() || "",
    subdistrict_name: initialData?.subdistrict_name || "",
    address_detail: initialData?.address_detail || "",
    postal_code: initialData?.postal_code || "",
    is_primary: initialData?.is_primary || false,
  });

  const [provinces, setProvinces] = useState<RajaOngkirItem[]>([]);
  const [cities, setCities] = useState<RajaOngkirItem[]>([]);
  const [districts, setDistricts] = useState<RajaOngkirItem[]>([]);
  const [subdistricts, setSubdistricts] = useState<RajaOngkirItem[]>([]);

  const [isLoading, setIsLoading] = useState({
    provinces: true,
    cities: false,
    districts: false,
    subdistricts: false,
    submit: false,
  });

  // Fetch provinsi saat komponen dimuat
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoading((prev) => ({ ...prev, provinces: true }));
      try {
        const response = await api.get("/location/provinces");
        const formattedData = response.data.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
        }));
        setProvinces(formattedData);
      } catch (err) {
        showError("Failed to load province data.");
      } finally {
        setIsLoading((prev) => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  // Fetch kota saat provinsi berubah (atau saat form edit dimuat dengan data provinsi)
  useEffect(() => {
    if (!formData.province_id) return;
    const fetchCities = async () => {
      setIsLoading((prev) => ({
        ...prev,
        cities: true,
        districts: false,
        subdistricts: false,
      }));
      setCities([]);
      setDistricts([]);
      setSubdistricts([]);
      try {
        const response = await api.get(
          `/location/cities/${formData.province_id}`
        );
        const formattedData = response.data.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
        }));
        setCities(formattedData);
      } catch (err) {
        showError("Failed to load city data.");
      } finally {
        setIsLoading((prev) => ({ ...prev, cities: false }));
      }
    };
    fetchCities();
  }, [formData.province_id]);

  // Fetch kecamatan saat kota berubah (atau saat form edit dimuat dengan data kota)
  useEffect(() => {
    if (!formData.city_id) return;
    const fetchDistricts = async () => {
      setIsLoading((prev) => ({ ...prev, districts: true }));
      setDistricts([]);
      setSubdistricts([]); // Reset anakannya
      try {
        const response = await api.get(
          `/location/districts/${formData.city_id}`
        );
        setDistricts(
          response.data.map((d: any) => ({ id: d.id.toString(), name: d.name }))
        );
      } catch (err) {
        showError("Failed to load sub-district data.");
      } finally {
        setIsLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, [formData.city_id]);

  useEffect(() => {
    if (!formData.district_id) return;
    const fetchSubdistricts = async () => {
      setIsLoading((prev) => ({ ...prev, subdistricts: true }));
      setSubdistricts([]);
      try {
        const response = await api.get(
          `/location/subdistricts/${formData.district_id}`
        );
        const formattedData = response.data.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
        }));
        setSubdistricts(formattedData);
      } catch (err) {
        showError("Failed to load sub-district data.");
      } finally {
        setIsLoading((prev) => ({ ...prev, subdistricts: false }));
      }
    };
    fetchSubdistricts();
  }, [formData.district_id]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (
    field: "province" | "city" | "district" | "subdistrict",
    value: string,
    items: RajaOngkirItem[]
  ) => {
    const selectedItem = items.find((item) => item.id === value);
    setFormData((prev) => ({
      ...prev,
      [`${field}_id`]: value,
      [`${field}_name`]: selectedItem?.name || "",
      ...(field === "province" && {
        city_id: "",
        city_name: "",
        district_id: "",
        district_name: "",
        subdistrict_id: "",
        subdistrict_name: "",
      }),
      ...(field === "city" && {
        district_id: "",
        district_name: "",
        subdistrict_id: "",
        subdistrict_name: "",
      }),
      ...(field === "district" && { subdistrict_id: "", subdistrict_name: "" }),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading((prev) => ({ ...prev, submit: true }));
    try {
      let newAddressData: Address;
      if (initialData) {
        // Untuk edit, kita anggap server mengembalikan data yang diperbarui
        const response = await api.put(
          `/addresses/${initialData.id}`,
          formData
        );
        newAddressData = response.data; // Asumsi backend mengembalikan data di 'data'
        showSuccess("Address updated successfully.");
      } else {
        // Untuk tambah baru, kita tangkap responsnya
        const response = await api.post("/addresses", formData);
        newAddressData = response.data; // Asumsi backend mengembalikan data di 'data'
        showSuccess("New address added successfully.");
      }
      onSuccess(newAddressData); // <-- Panggil onSuccess DENGAN data alamat baru
    } catch (err: any) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.values(errors).flat().join("\n");
        showError(errorMessages);
      } else {
        showError("An error occurred while saving the address.");
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4"
    >
      <div>
        <Label htmlFor="label" className="mb-2">Address Labels</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Exc: Home, Office, etc."
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recipient_name" className="mb-2">Recipient's name</Label>
          <Input
            id="recipient_name"
            value={formData.recipient_name}
            onChange={(e) => handleChange("recipient_name", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone_number" className="mb-2">Phone Number</Label>
          <Input
            id="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={(e) => handleChange("phone_number", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="province" className="mb-2">Province</Label>
          <Select
            value={formData.province_id}
            onValueChange={(v) => handleSelectChange("province", v, provinces)}
            disabled={isLoading.provinces}
            required
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoading.provinces ? "Loading..." : "Select Province..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {provinces.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="city" className="mb-2">City</Label>
          <Select
            value={formData.city_id}
            onValueChange={(v) => handleSelectChange("city", v, cities)}
            disabled={!formData.province_id || isLoading.cities}
            required
          >
            <SelectTrigger>
              <SelectValue
                placeholder={isLoading.cities ? "Loading..." : "Choose City..."}
              />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="district" className="mb-2">District</Label>
          <Select
            value={formData.district_id}
            onValueChange={(v) => handleSelectChange("district", v, districts)}
            disabled={!formData.city_id || isLoading.districts}
            required
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoading.districts ? "Loading..." : "Choose District..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="subdistrict" className="mb-2">Subdistrict</Label>
          <Select
            value={formData.subdistrict_id}
            onValueChange={(v) =>
              handleSelectChange("subdistrict", v, subdistricts)
            }
            disabled={!formData.district_id || isLoading.subdistricts}
            required
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  isLoading.subdistricts ? "Loading..." : "Select District..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subdistricts.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="postal_code" className="mb-2">Postal code</Label>
        <Input
          id="postal_code"
          value={formData.postal_code}
          onChange={(e) => handleChange("postal_code", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="address_detail" className="mb-2">Address Detail</Label>
        <Textarea
          id="address_detail"
          value={formData.address_detail}
          onChange={(e) => handleChange("address_detail", e.target.value)}
          placeholder="Enter detailed address here"
          required
        />
      </div>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="is_primary"
          checked={formData.is_primary}
          onCheckedChange={(checked) =>
            handleChange("is_primary", Boolean(checked))
          }
        />
        <Label htmlFor="is_primary" className="cursor-pointer">
          Make it the main address
        </Label>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading.submit}>
          {isLoading.submit && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {initialData ? "Save Changes" : "Add Address"}
        </Button>
      </div>
    </form>
  );
};
