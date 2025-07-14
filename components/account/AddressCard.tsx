"use client";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Home, Building, MapPin} from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Address } from "@/lib/types/profile";



export const AddressCard = ({ address, onAction, onEdit }: { address: Address; onAction: () => void; onEdit: () => void; }) => {
    const getIcon = (label: string) => {
        if (label.toLowerCase().includes('rumah')) return <Home className="h-5 w-5 mr-3 text-primary" />;
        if (label.toLowerCase().includes('kantor')) return <Building className="h-5 w-5 mr-3 text-primary" />;
        return <MapPin className="h-5 w-5 mr-3 text-primary" />;
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/addresses/${address.id}`);
            showSuccess('Address deleted successfully.');
            onAction();
        } catch (err) { showError('Failed to delete address.'); }
    };
    
    const handleSetPrimary = async () => {
        try {
            await api.post(`/addresses/${address.id}/set-primary`);
            showSuccess('Primary address changed successfully.');
            onAction();
        } catch(err) { showError('Failed to change primary address.'); }
    };

    return (
        <Card className={cn("relative transition-all", address.is_primary && "border-primary ring-2 ring-primary/20")}>
            {address.is_primary && <Badge className="absolute -top-2 -right-2">Main Address</Badge>}
            <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center">
                    {getIcon(address.label)}
                    <div>
                        <CardTitle className="text-md">{address.label}</CardTitle>
                        <CardDescription>{address.recipient_name} ({address.phone_number})</CardDescription>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
                        {!address.is_primary && <DropdownMenuItem onClick={handleSetPrimary}>Make it the Primary Address</DropdownMenuItem>}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This action will delete the address "{address.label}" permanently. You can't undo it.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Yes, Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
                <p>{address.address_detail}</p>
                <p>{address.subdistrict_name}, {address.district_name}, {address.city_name}</p>
                <p>{address.province_name}, {address.postal_code}</p>
            </CardContent>
        </Card>
    );
};
