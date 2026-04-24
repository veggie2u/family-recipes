"use client";

import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface FamilyFormValues {
  name: string;
  is_public: boolean;
}

interface FamilyFormProps {
  defaultValues?: Partial<FamilyFormValues>;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  cancelHref: string;
}

export function FamilyForm({
  defaultValues,
  action,
  submitLabel = "Save Family",
  cancelHref,
}: FamilyFormProps) {
  const form = useForm<FamilyFormValues>({
    defaultValues: {
      name: "",
      is_public: false,
      ...defaultValues,
    },
  });

  const onSubmit = async (values: FamilyFormValues) => {
    const formData = new FormData();
    formData.set("name", values.name);
    if (values.is_public) formData.set("is_public", "on");
    await action(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: "Name is required",
            maxLength: { value: 100, message: "Name must be 100 characters or less" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. The Johnsons" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-medium cursor-pointer">
                  Make this family public
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
          <Button asChild variant="outline">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
