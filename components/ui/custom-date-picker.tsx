"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

interface DatePickerProps {
    value?: string | Date; // Accepting string (yyyy-MM-dd) or Date object
    onChange: (date: string) => void; // Returns yyyy-MM-dd string
    placeholder?: string;
    className?: string;
    label?: string;
    error?: string;
    minDate?: Date;
    maxDate?: Date;
}

export function CustomDatePicker({ value, onChange, placeholder = "Select date", className, label, error }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        value ? (typeof value === 'string' ? new Date(value) : value) : undefined
    );
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Update internal state when prop changes
    useEffect(() => {
        if (value) {
            const date = typeof value === 'string' ? new Date(value) : value;
            setSelectedDate(date);
            setViewDate(date); // Sync view to selected date
        } else {
            setSelectedDate(undefined);
        }
    }, [value]);

    const calculatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + window.scrollY + 8, // 8px Offset
                left: rect.left + window.scrollX,
            });
        }
    };

    const toggleOpen = () => {
        if (!isOpen) {
            calculatePosition();
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    // Recalculate position on resize/scroll if open
    useEffect(() => {
        if (!isOpen) return;
        const handleResize = () => calculatePosition();
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleResize, true); // true for capture to catch all scrolls

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleResize, true);
        };
    }, [isOpen]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is outside both the input container AND the portal dropdown
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
    const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));

    const handleDayClick = (day: Date) => {
        const formatted = format(day, "yyyy-MM-dd");
        onChange(formatted);
        setSelectedDate(day);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(""); // Assuming parent handles empty string or check validity
        setSelectedDate(undefined);
        setIsOpen(false);
    };

    const handleToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        handleDayClick(today);
    };

    // Generate days
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className={cn("space-y-2", className)} >
            {label && <label className="text-sm font-semibold text-slate-600">{label}</label>}

            <div ref={containerRef} className="relative">
                <Button
                    type="button"
                    variant="outline"
                    onClick={toggleOpen}
                    className={cn(
                        "w-full pl-3 text-left font-normal h-11 border-slate-200 bg-white hover:bg-slate-50 transition-all rounded-xl relative overflow-hidden",
                        !value && "text-muted-foreground",
                        isOpen && "ring-2 ring-blue-500 border-blue-500"
                    )}
                >
                    {selectedDate ? (
                        <span className="text-slate-900 font-medium tracking-tight">
                            {format(selectedDate, "dd-MM-yyyy")}
                        </span>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50 absolute right-3" />
                </Button>

                {isOpen && typeof document !== "undefined" && createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            top: dropdownPos.top,
                            left: dropdownPos.left,
                            position: "absolute"
                        }}
                        className="z-[9999] mt-2 w-[280px] p-4 rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200 origin-top-left"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors">
                                <span className="text-sm font-bold text-slate-900">
                                    {format(viewDate, "MMMM, yyyy")}
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" onClick={handlePrevMonth} className="text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button type="button" onClick={handleNextMonth} className="text-slate-500 hover:text-slate-900 transition-colors p-1 hover:bg-slate-100 rounded-lg">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Names */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {weekDays.map((d) => (
                                <span key={d} className="text-[12px] font-medium text-slate-500">
                                    {d}
                                </span>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                            {days.map((day, idx) => {
                                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isTodayDate = isToday(day);

                                return (
                                    <button
                                        key={day.toString()}
                                        type="button"
                                        onClick={() => handleDayClick(day)}
                                        className={cn(
                                            "h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-all relative",
                                            !isCurrentMonth && "text-slate-300",
                                            isCurrentMonth && "text-slate-700 hover:bg-blue-50 font-medium",
                                            isTodayDate && !isSelected && "text-blue-600 font-bold",
                                            isSelected && "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:text-white"
                                        )}
                                    >
                                        {format(day, "d")}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer - Clear / Today */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={handleToday}
                                className="text-sm font-medium text-blue-500 hover:text-blue-700 transition-colors"
                            >
                                Today
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
    );
}
