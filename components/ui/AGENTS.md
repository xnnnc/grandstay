<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-24 | Updated: 2026-02-24 -->

# components/ui

## Purpose
shadcn/ui component library built on Radix UI primitives. Low-level, reusable, unstyled-by-default components that serve as building blocks for all feature components. Each exports a base component and related sub-components (e.g., `Card`, `CardHeader`, `CardContent`).

## Files (21 components)
| File | Component | Description |
|------|-----------|-------------|
| `avatar.tsx` | Avatar, AvatarImage, AvatarFallback | User avatar with fallback initials |
| `badge.tsx` | Badge | Status/label badge with variants |
| `breadcrumb.tsx` | Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator | Navigation breadcrumb trail |
| `button.tsx` | Button, buttonVariants | Primary interactive element with multiple variants and sizes |
| `calendar.tsx` | Calendar | Date picker calendar |
| `card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction, CardFooter | Container for grouped content |
| `dialog.tsx` | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogOverlay, DialogPortal | Modal dialog with Radix primitives |
| `dropdown-menu.tsx` | DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem | Context menu / dropdown menu |
| `input.tsx` | Input | Text input field |
| `label.tsx` | Label | Form field label |
| `popover.tsx` | Popover, PopoverTrigger, PopoverContent | Floating popover container |
| `select.tsx` | Select, SelectTrigger, SelectValue, SelectContent, SelectItem | Dropdown select input |
| `separator.tsx` | Separator | Dividing line (horizontal or vertical) |
| `sheet.tsx` | Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose | Slide-out sidebar panel |
| `sidebar.tsx` | Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarRail, SidebarTrigger | Collapsible sidebar navigation container |
| `skeleton.tsx` | Skeleton | Loading placeholder (animated shimmer) |
| `switch.tsx` | Switch | Toggle on/off switch |
| `table.tsx` | Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell | Data table structure |
| `tabs.tsx` | Tabs, TabsList, TabsTrigger, TabsContent | Tabbed interface |
| `textarea.tsx` | Textarea | Multi-line text input |
| `tooltip.tsx` | Tooltip, TooltipTrigger, TooltipContent, TooltipProvider | Hover tooltip |

## Key Characteristics
- **Radix UI based**: All components wrap Radix UI primitives for accessibility
- **Unstyled by default**: Base structure + Tailwind CSS for styling
- **Data attributes**: Use `data-slot` and `data-*` for styling hooks
- **Variants**: Use `class-variance-authority` (cva) for prop-based variants
- **Dark mode**: All styles include dark mode support with `dark:` prefix

## For AI Agents

### Working In This Directory
- These are low-level building blocks — do not add business logic here
- Modify with care — changes affect all feature components that use them
- Prefer adding variants over modifying base styles
- Use `cn()` for merging Tailwind classes
- All components are unstyled except for structure and accessibility
- Keep components as thin wrappers over Radix UI

### Common Patterns
- **Compound components**: Base component wraps Radix primitive, sub-components use `data-slot`
- **Variants**: Use CVA for variant definitions, export as `componentVariants`
- **Props spread**: Always allow spreading remaining props to underlying element
- **Accessibility**: Radix UI handles aria attributes; preserve them

### Styling Guidelines
- Use Tailwind utility classes exclusively
- Use `cn()` to conditionally merge classes
- Respect dark mode with `dark:` prefix
- Use CSS custom properties for theme colors (defined in `app/globals.css`)
- Use data attributes (`data-slot="component-name"`) for parent-child styling hooks

## Dependencies

### External
- Radix UI - Base primitives (@radix-ui/*)
- React 19 - Component API
- Tailwind CSS 4 - Utility styling
- class-variance-authority - Variant definitions
- @phosphor-icons/react - Icons (for close buttons, etc.)

### Internal
- `@/lib/utils` - `cn()` function for class merging
