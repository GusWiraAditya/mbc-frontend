"use client";

// --- 1. IMPORTS (diasumsikan ada di setiap file yang membutuhkannya) ---
import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus,  MapPin,} from "lucide-react";
import { showError} from "@/lib/toast";
import { Address } from "@/lib/types/profile";
import { AddressForm } from "./AddressForm";
import { AddressCard } from "./AddressCard";

export const AddressList = ( { onAction }: { onAction: () => void }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/addresses');
            setAddresses(response.data);
        } catch (err) {
            showError("Failed to load address list.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

    const handleAddClick = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (address: Address) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleFormSuccess = () => {
        setIsFormOpen(false);
        fetchAddresses();
        onAction();
    };

    return (
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div>
                    <CardTitle>Address</CardTitle>
                    <CardDescription>Manage all your shipping addresses here.</CardDescription>
                </div>
                <Button onClick={handleAddClick}><Plus className="h-4 w-4 mr-2"/> Add New Address</Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4"><Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" /></div>
                ) : addresses.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {addresses.map(address => <AddressCard key={address.id} address={address} onAction={fetchAddresses} onEdit={() => handleEditClick(address)} />)}
                    </div>
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <MapPin className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-4 text-muted-foreground">You don't have any saved addresses yet.</p>
                        <Button variant="outline" className="mt-4" onClick={handleAddClick}>Add Your First Address</Button>
                    </div>
                )}
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent className="sm:max-w-2xl md:max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                            <DialogDescription>Make sure your address data is correct for easy delivery.</DialogDescription>
                        </DialogHeader>
                        <AddressForm initialData={editingAddress} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};