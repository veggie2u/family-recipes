"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { updateProfile } from "./actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  defaultName: string;
  defaultDisplayName: string;
}

export function ProfileForm({ defaultName, defaultDisplayName }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(defaultName);
  const [currentDisplayName, setCurrentDisplayName] = useState(defaultDisplayName);

  const form = useForm({
    defaultValues: { name: currentName },
  });

  const onSubmit = async (values: { name: string }) => {
    const formData = new FormData();
    formData.set("name", values.name);
    await updateProfile(formData);
    setCurrentName(values.name);
    setCurrentDisplayName(values.name);
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.reset({ name: currentName });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-semibold">{currentDisplayName}</h1>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
        <FormField
          control={form.control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 self-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
