import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";
import {
  CalendarIcon,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { FC} from "react";
import { useEffect, useRef, useState } from "react";

import type { BookingModalProps, ValidationError } from "@/utils/interface";
import type {
  BookingFormData} from "@/validations/user/bookingValidation";
import {
  useBookingValidation,
} from "@/validations/user/bookingValidation";
export const BookingModal: FC<BookingModalProps> = ({
  isOpen,
  onOpenChange,
  bookingForm,
  setBookingForm,
  onSubmit: originalOnSubmit,
  selectedDate,
  unavailableDates,
  onDateSelect,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const { validateForm } = useBookingValidation(unavailableDates);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const TODAY = new Date();
  TODAY.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (selectedDate) {
      const [, monthStr, yearStr] = selectedDate.split("/");
      setCurrentMonth(
        new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1),
      );
    }
  }, [selectedDate, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    if (showCalendar)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const formatDate = (date: Date) => date.toLocaleDateString("en-GB");

  const getDateStatus = (date: Date) => {
    const formatted = formatDate(date);
    if (date < TODAY) return "past";
    if (formatted === bookingForm.selectedDate) return "selected";
    if (unavailableDates.includes(formatted)) return "unavailable";
    return "available";
  };

  const handleDateClick = (date: Date) => {
    if (date < TODAY) return;
    const formatted = formatDate(date);
    if (!unavailableDates.includes(formatted)) {
      onDateSelect(date);
      // Update bookingForm.selectedDate so calendar reflects the selection
      setBookingForm((prev) => ({ ...prev, selectedDate: formatted }));
      setShowCalendar(false);
      clearFieldError("selectedDate");
    }
  };

  const clearFieldError = (fieldName: string) => {
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const validateField = async (fieldName: string, value: unknown) => {
    try {
      await validateForm({ ...bookingForm, [fieldName]: value });
      clearFieldError(fieldName);
    } catch (error) {
      if (error && typeof error === "object" && "inner" in error) {
        const ve = error as ValidationError;
        const fieldError = ve.inner?.find((e) => e.path === fieldName);
        setValidationErrors((prev) => ({
          ...prev,
          ...(fieldError ? { [fieldName]: fieldError.message } : {}),
        }));
      }
    }
  };

  const handleInputChange = (
    fieldName: string,
    value: BookingFormData[keyof BookingFormData],
  ) => {
    setBookingForm((prev) => ({ ...prev, [fieldName]: value }));
    validateField(fieldName, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSubmitSuccess(false);

    // Guard: block submit if selected date is unavailable
    if (
      bookingForm.selectedDate &&
      unavailableDates.includes(bookingForm.selectedDate)
    ) {
      setValidationErrors((prev) => ({
        ...prev,
        selectedDate:
          "Selected date is unavailable. Please choose another date.",
      }));
      setIsSubmitting(false);
      return;
    }

    try {
      const { isValid, errors } = await validateForm(bookingForm);
      if (!isValid) {
        setValidationErrors(errors);
        setIsSubmitting(false);
        return;
      }
      setValidationErrors({});
      await originalOnSubmit(e, bookingForm);
      setIsSubmitSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      if (error && typeof error === "object" && "inner" in error) {
        const ve = error as ValidationError;
        const errors: Record<string, string> = {};
        ve.inner?.forEach((err) => {
          if (err.path) errors[err.path] = err.message;
        });
        setValidationErrors(errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const DateInput = () => (
    <div className="relative w-full">
      <Input
        label="Selected Date"
        value={bookingForm.selectedDate || "Select a date"}
        isReadOnly
        required
        className="cursor-pointer w-full"
        onClick={() => setShowCalendar(true)}
        errorMessage={validationErrors.selectedDate}
        isInvalid={!!validationErrors.selectedDate}
        endContent={<CalendarIcon className="w-4 h-4" />}
      />
      {showCalendar && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-1 bg-white rounded-lg shadow-xl border p-4 min-w-[280px]"
        >
          {/* Month navigation */}
          <div className="flex justify-between items-center mb-4">
            <Button
              isIconOnly
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                  ),
                );
              }}
              disabled={
                currentMonth <=
                new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
              }
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {currentMonth.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              isIconOnly
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                  ),
                );
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500"
              >
                {day}
              </div>
            ))}

            {/* Empty cells */}
            {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map(
              (_, i) => (
                <div key={`empty-${i}`} />
              ),
            )}

            {/* Date cells */}
            {Array.from({ length: getDaysInMonth(currentMonth) }).map(
              (_, i) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  i + 1,
                );
                const status = getDateStatus(date);

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateClick(date);
                    }}
                    disabled={status === "past" || status === "unavailable"}
                    className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-sm
                                        ${status === "past" ? "text-gray-300 cursor-not-allowed" : ""}
                                        ${status === "selected" ? "bg-blue-500 text-white" : ""}
                                        ${status === "unavailable" ? "bg-red-100 text-red-400 cursor-not-allowed" : ""}
                                        ${status === "available" ? "hover:bg-blue-100 hover:text-blue-600 cursor-pointer" : ""}
                                    `}
                  >
                    {i + 1}
                  </button>
                );
              },
            )}
          </div>

          {/* Legend */}
          <div className="flex gap-3 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-bold">Service Booking Request</h2>
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Name"
                    placeholder="Enter your name"
                    value={bookingForm.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={() => validateField("name", bookingForm.name)}
                    errorMessage={validationErrors.name}
                    isInvalid={!!validationErrors.name}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                    value={bookingForm.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => validateField("email", bookingForm.email)}
                    errorMessage={validationErrors.email}
                    isInvalid={!!validationErrors.email}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DateInput />
                  <Input
                    label="No. of Days"
                    type="number"
                    min={1}
                    max={2}
                    value={bookingForm.noOfDays.toString()}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      handleInputChange(
                        "noOfDays",
                        Math.min(Math.max(value, 1), 2),
                      );
                    }}
                    onBlur={() =>
                      validateField("noOfDays", bookingForm.noOfDays)
                    }
                    errorMessage={validationErrors.noOfDays}
                    isInvalid={!!validationErrors.noOfDays}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Venue"
                    placeholder="Enter venue"
                    value={bookingForm.venue}
                    onChange={(e) => handleInputChange("venue", e.target.value)}
                    onBlur={() => validateField("venue", bookingForm.venue)}
                    errorMessage={validationErrors.venue}
                    isInvalid={!!validationErrors.venue}
                    required
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    value={bookingForm.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    onBlur={() => validateField("phone", bookingForm.phone)}
                    errorMessage={validationErrors.phone}
                    isInvalid={!!validationErrors.phone}
                    required
                  />
                </div>

                <Input
                  label="Full Address"
                  placeholder="Enter full address"
                  value={bookingForm.fullAddress}
                  onChange={(e) =>
                    handleInputChange("fullAddress", e.target.value)
                  }
                  onBlur={() =>
                    validateField("fullAddress", bookingForm.fullAddress)
                  }
                  errorMessage={validationErrors.fullAddress}
                  isInvalid={!!validationErrors.fullAddress}
                  required
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="City"
                    placeholder="Enter city"
                    value={bookingForm.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    onBlur={() => validateField("city", bookingForm.city)}
                    errorMessage={validationErrors.city}
                    isInvalid={!!validationErrors.city}
                    required
                  />
                  <Input
                    label="Landmark"
                    placeholder="Enter nearby landmark"
                    value={bookingForm.landmark}
                    onChange={(e) =>
                      handleInputChange("landmark", e.target.value)
                    }
                    onBlur={() =>
                      validateField("landmark", bookingForm.landmark)
                    }
                    errorMessage={validationErrors.landmark}
                    isInvalid={!!validationErrors.landmark}
                  />
                  <Input
                    label="Pincode"
                    placeholder="Enter pincode"
                    value={bookingForm.pincode}
                    onChange={(e) =>
                      handleInputChange("pincode", e.target.value)
                    }
                    onBlur={() => validateField("pincode", bookingForm.pincode)}
                    errorMessage={validationErrors.pincode}
                    isInvalid={!!validationErrors.pincode}
                    required
                  />
                </div>

                <Textarea
                  label="Message"
                  placeholder="Enter your message"
                  value={bookingForm.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  onBlur={() => validateField("message", bookingForm.message)}
                  errorMessage={validationErrors.message}
                  isInvalid={!!validationErrors.message}
                  required
                />
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="danger"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                endContent={
                  isSubmitSuccess ? <CheckIcon className="w-5 h-5" /> : null
                }
              >
                {isSubmitSuccess ? "Submitted" : "Submit Request"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
