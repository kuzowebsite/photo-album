"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Plus,
  Trash2,
  Users,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  X,
  Download,
  Camera,
  ChevronRight,
} from "lucide-react"
import { database } from "@/lib/firebase"
import { ref, push, set, remove, onValue, off } from "firebase/database"

interface User {
  id: string
  username: string
  profileName: string
  profilePicture: string
  phoneNumber: string
  password: string
}

interface Event {
  id: string
  title: string
  date: string
  image: string
  members: number
  createdBy: string
  memberIds: string[]
}

interface Photo {
  id: string
  url: string
  eventId: string
  addedBy: string
}

interface FamilyMember {
  id: string
  name: string
  avatar: string
  eventsCount: number
  lastActivity: string
  isLocked: boolean
  members: string[]
}

export default function PhotoAlbumApp() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authView, setAuthView] = useState<"login" | "register" | "forgot">("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    username: "",
    profileName: "",
    profilePicture: null,
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })

  // Forgot password state
  const [forgotForm, setForgotForm] = useState({
    phoneNumber: "",
    verificationCode: "",
    newPassword: "",
    confirmNewPassword: "",
    newUsername: "",
  })
  const [forgotStep, setForgotStep] = useState<"phone" | "verify" | "reset">("phone")
  const [forgotType, setForgotType] = useState<"password" | "username">("password")

  const [users, setUsers] = useState<User[]>([])
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    // Load users from Firebase
    const usersRef = ref(database, "users")
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({ ...data[key], id: key }))
        setUsers(usersArray)
      }
    })

    // Load family members from Firebase
    const familyRef = ref(database, "familyMembers")
    onValue(familyRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const familyArray = Object.keys(data).map((key) => ({ ...data[key], id: key }))
        setFamilyMembers(familyArray)
      }
    })

    // Load events from Firebase
    const eventsRef = ref(database, "events")
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const eventsArray = Object.keys(data).map((key) => ({ ...data[key], id: key }))
        setEvents(eventsArray)
      }
    })

    // Load photos from Firebase
    const photosRef = ref(database, "photos")
    onValue(photosRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const photosArray = Object.keys(data).map((key) => ({ ...data[key], id: key }))
        setPhotos(photosArray)
      }
    })

    // Cleanup listeners on unmount
    return () => {
      off(usersRef)
      off(familyRef)
      off(eventsRef)
      off(photosRef)
    }
  }, [])

  const [currentView, setCurrentView] = useState<"home" | "events" | "album">("home")
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [currentUserId] = useState("user1")
  const [activeEventsTab, setActiveEventsTab] = useState<"all" | "created" | "members">("all")
  const [activeAlbumTab, setActiveAlbumTab] = useState<"all" | "added">("all")

  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDate, setNewEventDate] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupAvatar, setNewGroupAvatar] = useState("")
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false)
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false)
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [selectedLockedGroup, setSelectedLockedGroup] = useState<FamilyMember | null>(null)
  const [showCreateEventDialog, setShowCreateEventDialog] = useState(false)
  const [showDeleteEventDialog, setShowDeleteEventDialog] = useState(false)
  const [showAddPhotoDialog, setShowAddPhotoDialog] = useState(false)
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false)
  const [newPhotoFile, setNewPhotoFile] = useState("")
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false) // Added member management dialogs
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false) // Added member management dialogs
  const [newMemberName, setNewMemberName] = useState("") // Added new member name state

  const [allUsers] = useState([
    { id: "user1", name: "Батаа", avatar: "/birthday-party.png" },
    { id: "user2", name: "Сарангэрэл", avatar: "/bridal-shower-party.jpg" },
    { id: "user3", name: "Болдбаатар", avatar: "/outdoor-wedding-ceremony.png" },
    { id: "user4", name: "Оюунчимэг", avatar: "/birthday-celebration.jpg" },
    { id: "user5", name: "Энхбаяр", avatar: "/birthday-party-fun.jpg" },
    { id: "user6", name: "Цэцэгмаа", avatar: "/wedding-couple-dancing.png" },
    { id: "user7", name: "Баярмаа", avatar: "/wedding-ceremony-kiss.jpg" },
    { id: "user8", name: "Мөнхбат", avatar: "/wedding-reception.png" },
  ])

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  const handleLogin = () => {
    const user = users.find((u) => u.username === loginForm.username && u.password === loginForm.password)
    if (user) {
      setCurrentUser(user)
      setIsAuthenticated(true)
      setLoginForm({ username: "", password: "" })
    } else {
      alert("Нэвтрэх нэр эсвэл нууц үг буруу байна")
    }
  }

  const handleRegister = async () => {
    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Нууц үг таарахгүй байна")
      return
    }

    if (users.some((u) => u.username === registerForm.username)) {
      alert("Энэ нэвтрэх нэр аль хэдийн бүртгэгдсэн байна")
      return
    }

    try {
      let profilePictureData = "/placeholder.svg?height=40&width=40"

      // Convert profile picture to base64 if provided
      if (registerForm.profilePicture) {
        const file = registerForm.profilePicture
        const reader = new FileReader()
        profilePictureData = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      }

      const newUser = {
        username: registerForm.username,
        profileName: registerForm.profileName,
        profilePicture: profilePictureData,
        phoneNumber: registerForm.phoneNumber,
        password: registerForm.password,
      }

      const usersRef = ref(database, "users")
      const newUserRef = push(usersRef)
      const userId = newUserRef.key

      await set(newUserRef, {
        ...newUser,
        id: userId,
        createdAt: new Date().toISOString(),
      })

      setUsers((prev) => [...prev, { ...newUser, id: userId }])

      setRegisterForm({
        username: "",
        profileName: "",
        profilePicture: null,
        phoneNumber: "",
        password: "",
        confirmPassword: "",
      })
      setAuthView("login")
      alert("Амжилттай бүртгэгдлээ!")
    } catch (error) {
      console.error("Registration error:", error)
      alert("Бүртгэл үүсгэхэд алдаа гарлаа")
    }
  }

  const handleSendVerificationCode = () => {
    const user = users.find((u) => u.phoneNumber === forgotForm.phoneNumber)
    if (user) {
      // In real app, send SMS verification code
      alert("Баталгаажуулах код илгээгдлээ: 1234")
      setForgotStep("verify")
    } else {
      alert("Энэ утасны дугаараар бүртгэгдсэн хэрэглэгч олдсонгүй")
    }
  }

  const handleVerifyCode = () => {
    if (forgotForm.verificationCode === "1234") {
      setForgotStep("reset")
    } else {
      alert("Баталгаажуулах код буруу байна")
    }
  }

  const handleResetPassword = () => {
    if (forgotForm.newPassword !== forgotForm.confirmNewPassword) {
      alert("Нууц үг таарахгүй байна")
      return
    }

    const userIndex = users.findIndex((u) => u.phoneNumber === forgotForm.phoneNumber)
    if (userIndex !== -1) {
      const updatedUsers = [...users]
      if (forgotType === "password") {
        updatedUsers[userIndex].password = forgotForm.newPassword
      } else {
        updatedUsers[userIndex].username = forgotForm.newUsername
      }
      setUsers(updatedUsers)
      alert("Амжилттай солигдлоо")
      setAuthView("login")
      setForgotStep("phone")
      setForgotForm({
        phoneNumber: "",
        verificationCode: "",
        newPassword: "",
        confirmNewPassword: "",
        newUsername: "",
      })
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    setCurrentView("home")
  }

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setRegisterForm({
        ...registerForm,
        profilePicture: file,
      })
    }
  }

  const handleCreateGroup = async () => {
    if (newGroupName) {
      try {
        let avatarData = "/placeholder.svg?height=40&width=40"

        if (newGroupAvatar) {
          avatarData = newGroupAvatar // Already base64 from file reader
        }

        const newGroup: Omit<FamilyMember, "id"> = {
          name: newGroupName,
          avatar: avatarData, // Store base64 data instead of Storage URL
          eventsCount: 0,
          lastActivity: "Just created",
          isLocked: false,
          members: [currentUserId],
        }

        // Save to Firebase
        const familyRef = ref(database, "familyMembers")
        const newGroupRef = push(familyRef)
        await set(newGroupRef, newGroup)

        setNewGroupName("")
        setNewGroupAvatar("")
        setShowCreateGroupDialog(false)
      } catch (error) {
        console.error("Create group error:", error)
        alert("Бүлэг үүсгэхэд алдаа гарлаа")
      }
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const groupRef = ref(database, `familyMembers/${groupId}`)
      await remove(groupRef)
      setShowDeleteGroupDialog(false)
    } catch (error) {
      console.error("Delete group error:", error)
      alert("Бүлэг устгахад алдаа гарлаа")
    }
  }

  const isGroupMember = (member: FamilyMember) => {
    return member.members.includes(currentUserId)
  }

  const handleToggleLock = async (memberId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    const member = familyMembers.find((m) => m.id === memberId)
    if (!member || !isGroupMember(member)) {
      alert("Зөвхөн бүлгийн гишүүд түгжээ солих боломжтой!")
      return
    }

    try {
      const memberRef = ref(database, `familyMembers/${memberId}`)
      await set(memberRef, { ...member, isLocked: !member.isLocked })
    } catch (error) {
      console.error("Toggle lock error:", error)
      alert("Түгжээ солихад алдаа гарлаа")
    }
  }

  const canAccessGroup = (member: FamilyMember) => {
    if (!member.isLocked) return true // Unlocked groups are accessible to everyone
    return member.members.includes(currentUserId) // Locked groups only accessible to members
  }

  const handleMemberClick = (member: FamilyMember) => {
    if (!canAccessGroup(member)) {
      setSelectedLockedGroup(member)
      setShowPasscodeDialog(true)
      return
    }
    setSelectedMember(member)
    setCurrentView("events")
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setCurrentView("album")
  }

  const handleBackFromEvents = () => {
    setSelectedMember(null)
    setCurrentView("home")
  }

  const handleBackFromAlbum = () => {
    setSelectedEvent(null)
    setCurrentView("events")
  }

  const handlePasscodeSubmit = () => {
    if (passcode === "1234" && selectedLockedGroup) {
      // Check if user is a member of the group
      if (selectedLockedGroup.members.includes(currentUserId)) {
        setSelectedMember(selectedLockedGroup)
        setCurrentView("events")
      } else {
        alert("Та энэ бүлгийн гишүүн биш байна!")
      }
    } else {
      alert("Буруу нууц код!")
    }
    setShowPasscodeDialog(false)
    setPasscode("")
    setSelectedLockedGroup(null)
  }

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewGroupAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateEvent = async () => {
    if (newEventTitle && newEventDate) {
      try {
        const newEvent: Omit<Event, "id"> = {
          title: newEventTitle,
          date: newEventDate,
          image: "/new-event-celebration.jpg",
          members: 1,
          createdBy: currentUserId,
          memberIds: [currentUserId],
        }

        // Save to Firebase
        const eventsRef = ref(database, "events")
        const newEventRef = push(eventsRef)
        await set(newEventRef, newEvent)

        setNewEventTitle("")
        setNewEventDate("")
        setShowCreateEventDialog(false)
      } catch (error) {
        console.error("Create event error:", error)
        alert("Арга хэмжээ үүсгэхэд алдаа гарлаа")
      }
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const eventRef = ref(database, `events/${eventId}`)
      await remove(eventRef)
      setShowDeleteEventDialog(false)
    } catch (error) {
      console.error("Delete event error:", error)
      alert("Арга хэмжээ устгахад алдаа гарлаа")
    }
  }

  const handleAddPhoto = async () => {
    if (newPhotoFile && selectedEvent) {
      try {
        const newPhoto: Omit<Photo, "id"> = {
          url: newPhotoFile, // Store base64 data directly
          eventId: selectedEvent.id,
          addedBy: currentUserId,
        }

        // Save to Firebase Database
        const photosRef = ref(database, "photos")
        const newPhotoRef = push(photosRef)
        await set(newPhotoRef, newPhoto)

        setNewPhotoFile("")
        setShowAddPhotoDialog(false)
      } catch (error) {
        console.error("Add photo error:", error)
        alert("Зураг нэмэхэд алдаа гарлаа")
      }
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewPhotoFile(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDownloadPhoto = (photo: Photo) => {
    const link = document.createElement("a")
    link.href = photo.url
    link.download = `photo-${photo.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
    setShowPhotoModal(true)
  }

  const eventPhotos = selectedEvent ? photos.filter((photo) => photo.eventId === selectedEvent.id) : []

  const getPhotoCount = (eventId: string) => {
    return photos.filter((photo) => photo.eventId === eventId).length
  }

  const getFilteredEvents = () => {
    if (activeEventsTab === "created") {
      return events.filter((event) => event.createdBy === currentUserId)
    }
    return events
  }

  const getFilteredPhotos = () => {
    if (activeAlbumTab === "added") {
      return eventPhotos.filter((photo) => photo.addedBy === currentUserId)
    }
    return eventPhotos
  }

  const getEventMembers = () => {
    if (!selectedEvent) return []
    return allUsers.filter((user) => selectedEvent.memberIds.includes(user.id))
  }

  const handleAddMember = async () => {
    if (newMemberName && selectedEvent) {
      try {
        const newUserId = `user${Date.now()}`
        const updatedEvent = {
          ...selectedEvent,
          memberIds: [...selectedEvent.memberIds, newUserId],
          members: selectedEvent.members + 1,
        }

        // Save to Firebase
        const eventRef = ref(database, `events/${selectedEvent.id}`)
        await set(eventRef, updatedEvent)

        setSelectedEvent(updatedEvent)
        setNewMemberName("")
        setShowAddMemberDialog(false)
      } catch (error) {
        console.error("Add member error:", error)
        alert("Гишүүн нэмэхэд алдаа гарлаа")
      }
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (selectedEvent) {
      try {
        const updatedEvent = {
          ...selectedEvent,
          memberIds: selectedEvent.memberIds.filter((id) => id !== memberId),
          members: selectedEvent.members - 1,
        }

        // Save to Firebase
        const eventRef = ref(database, `events/${selectedEvent.id}`)
        await set(eventRef, updatedEvent)

        setSelectedEvent(updatedEvent)
        setShowRemoveMemberDialog(false)
      } catch (error) {
        console.error("Remove member error:", error)
        alert("Гишүүн хасахад алдаа гарлаа")
      }
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-sm mx-auto bg-white border-2 border-black min-h-screen">
        {!isAuthenticated ? (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <Card className="border-2 border-foreground shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-10">
                    <div className="mb-6">
                      <div className="w-20 h-20 mx-auto bg-foreground rounded-full flex items-center justify-center mb-4">
                        <Camera className="w-10 h-10 text-background" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">Гэр бүлийн цомог</h1>
                    <p className="text-muted-foreground text-lg">
                      {authView === "login" && "Нэвтрэх"}
                      {authView === "register" && "Бүртгүүлэх"}
                      {authView === "forgot" && "Нууц үг сэргээх"}
                    </p>
                  </div>

                  {authView === "login" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-foreground font-medium">
                          Нэвтрэх нэр
                        </Label>
                        <Input
                          id="username"
                          type="text"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          className="border-2 border-border focus:border-foreground h-12 text-base"
                          placeholder="Нэвтрэх нэрээ оруулна уу"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-foreground font-medium">
                          Нууц үг
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            className="border-2 border-border focus:border-foreground h-12 text-base pr-12"
                            placeholder="Нууц үгээ оруулна уу"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-muted"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={handleLogin}
                        className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium"
                      >
                        Нэвтрэх
                      </Button>
                      <div className="text-center space-y-3 pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setAuthView("register")}
                          className="text-foreground hover:bg-muted font-medium"
                        >
                          Бүртгүүлэх
                        </Button>
                        <br />
                        <Button
                          variant="ghost"
                          onClick={() => setAuthView("forgot")}
                          className="text-muted-foreground hover:bg-muted text-sm"
                        >
                          Нэвтрэх нэр / Нууц үг мартсан
                        </Button>
                      </div>
                    </div>
                  )}

                  {authView === "register" && (
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-foreground font-medium">
                          Нэвтрэх нэр
                        </Label>
                        <Input
                          id="reg-username"
                          type="text"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          className="border-2 border-border focus:border-foreground h-12 text-base"
                          placeholder="Нэвтрэх нэрээ оруулна уу"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-name" className="text-foreground font-medium">
                          Профайл нэр
                        </Label>
                        <Input
                          id="profile-name"
                          type="text"
                          value={registerForm.profileName}
                          onChange={(e) => setRegisterForm({ ...registerForm, profileName: e.target.value })}
                          className="border-2 border-border focus:border-foreground h-12 text-base"
                          placeholder="Профайл нэрээ оруулна уу"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-picture" className="text-foreground font-medium">
                          Профайл зураг <span className="text-muted-foreground text-sm">(заавал биш)</span>
                        </Label>
                        <Input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="border-2 border-border focus:border-foreground h-12 text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80"
                        />
                        {registerForm.profilePicture && (
                          <div className="mt-3 flex justify-center">
                            <img
                              src={URL.createObjectURL(registerForm.profilePicture) || "/placeholder.svg"}
                              alt="Profile preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-foreground"
                            />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-foreground font-medium">
                          Утасны дугаар
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={registerForm.phoneNumber}
                          onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                          className="border-2 border-border focus:border-foreground h-12 text-base"
                          placeholder="Утасны дугаараа оруулна уу"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-foreground font-medium">
                          Нууц үг
                        </Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            type={showPassword ? "text" : "password"}
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="border-2 border-border focus:border-foreground h-12 text-base pr-12"
                            placeholder="Нууц үгээ оруулна уу"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-muted"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-foreground font-medium">
                          Нууц үг давтах
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            className="border-2 border-border focus:border-foreground h-12 text-base pr-12"
                            placeholder="Нууц үгээ дахин оруулна уу"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-muted"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={handleRegister}
                        className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium mt-6"
                      >
                        Бүртгүүлэх
                      </Button>
                      <div className="text-center pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setAuthView("login")}
                          className="text-muted-foreground hover:bg-muted"
                        >
                          Нэвтрэх хуудас руу буцах
                        </Button>
                      </div>
                    </div>
                  )}

                  {authView === "forgot" && (
                    <div className="space-y-6">
                      {forgotStep === "phone" && (
                        <>
                          <div className="text-center mb-6">
                            <div className="flex gap-2 justify-center mb-6">
                              <Button
                                variant={forgotType === "password" ? "default" : "outline"}
                                onClick={() => setForgotType("password")}
                                className={
                                  forgotType === "password"
                                    ? "bg-foreground text-background"
                                    : "border-2 border-foreground text-foreground hover:bg-muted"
                                }
                              >
                                Нууц үг мартсан
                              </Button>
                              <Button
                                variant={forgotType === "username" ? "default" : "outline"}
                                onClick={() => setForgotType("username")}
                                className={
                                  forgotType === "username"
                                    ? "bg-foreground text-background"
                                    : "border-2 border-foreground text-foreground hover:bg-muted"
                                }
                              >
                                Нэвтрэх нэр мартсан
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="forgot-phone" className="text-foreground font-medium">
                              Утасны дугаар
                            </Label>
                            <Input
                              id="forgot-phone"
                              type="tel"
                              value={forgotForm.phoneNumber}
                              onChange={(e) => setForgotForm({ ...forgotForm, phoneNumber: e.target.value })}
                              className="border-2 border-border focus:border-foreground h-12 text-base"
                              placeholder="Бүртгэлтэй утасны дугаараа оруулна уу"
                            />
                          </div>
                          <Button
                            onClick={handleSendVerificationCode}
                            className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium"
                          >
                            Баталгаажуулах код илгээх
                          </Button>
                        </>
                      )}

                      {forgotStep === "verify" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="verification-code" className="text-foreground font-medium">
                              Баталгаажуулах код
                            </Label>
                            <Input
                              id="verification-code"
                              type="text"
                              value={forgotForm.verificationCode}
                              onChange={(e) => setForgotForm({ ...forgotForm, verificationCode: e.target.value })}
                              className="border-2 border-border focus:border-foreground h-12 text-base text-center tracking-widest"
                              placeholder="1234"
                              maxLength={4}
                            />
                            <p className="text-sm text-muted-foreground text-center">
                              Утас руу ирсэн 4 оронтой кодыг оруулна уу
                            </p>
                          </div>
                          <Button
                            onClick={handleVerifyCode}
                            className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium"
                          >
                            Баталгаажуулах
                          </Button>
                        </>
                      )}

                      {forgotStep === "reset" && (
                        <>
                          {forgotType === "username" && (
                            <div className="space-y-2">
                              <Label htmlFor="new-username" className="text-foreground font-medium">
                                Шинэ нэвтрэх нэр
                              </Label>
                              <Input
                                id="new-username"
                                type="text"
                                value={forgotForm.newUsername}
                                onChange={(e) => setForgotForm({ ...forgotForm, newUsername: e.target.value })}
                                className="border-2 border-border focus:border-foreground h-12 text-base"
                                placeholder="Шинэ нэвтрэх нэрээ оруулна уу"
                              />
                            </div>
                          )}
                          {forgotType === "password" && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="new-password" className="text-foreground font-medium">
                                  Шинэ нууц үг
                                </Label>
                                <Input
                                  id="new-password"
                                  type="password"
                                  value={forgotForm.newPassword}
                                  onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                                  className="border-2 border-border focus:border-foreground h-12 text-base"
                                  placeholder="Шинэ нууц үгээ оруулна уу"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirm-new-password" className="text-foreground font-medium">
                                  Шинэ нууц үг давтах
                                </Label>
                                <Input
                                  id="confirm-new-password"
                                  type="password"
                                  value={forgotForm.confirmNewPassword}
                                  onChange={(e) => setForgotForm({ ...forgotForm, confirmNewPassword: e.target.value })}
                                  className="border-2 border-border focus:border-foreground h-12 text-base"
                                  placeholder="Шинэ нууц үгээ дахин оруулна уу"
                                />
                              </div>
                            </>
                          )}
                          <Button
                            onClick={handleResetPassword}
                            className="w-full bg-foreground text-background hover:bg-foreground/90 h-12 text-base font-medium"
                          >
                            {forgotType === "password" ? "Нууц үг солих" : "Нэвтрэх нэр солих"}
                          </Button>
                        </>
                      )}

                      <div className="text-center pt-4">
                        <Button
                          variant="ghost"
                          onClick={() => setAuthView("login")}
                          className="text-muted-foreground hover:bg-muted"
                        >
                          Нэвтрэх хуудас руу буцах
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {currentView === "home" && (
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pt-2">
                  <h1 className="text-xl font-semibold text-black bg-white px-3 py-1 rounded-lg border border-black shadow-lg">
                    Гэр бүлийн цомог
                  </h1>
                  <div className="flex items-center gap-2">
                    <Search className="w-6 h-6 text-black" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <MoreHorizontal className="w-6 h-6 text-black" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-black">
                        <DropdownMenuItem onClick={() => setShowCreateGroupDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Бүлэг нэмэх
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDeleteGroupDialog(true)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Бүлэг устгах
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Гарах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {currentUser && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-black">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.profilePicture || "/placeholder.svg"}
                        alt={currentUser.profileName}
                        className="w-10 h-10 rounded-full object-cover border border-black"
                      />
                      <div>
                        <p className="font-semibold text-black">{currentUser.profileName}</p>
                        <p className="text-sm text-gray-600">@{currentUser.username}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Family Members List */}
                <div className="space-y-3">
                  {familyMembers.map((member) => (
                    <Card
                      key={member.id}
                      className={`cursor-pointer transition-colors ${
                        canAccessGroup(member)
                          ? "bg-white hover:bg-gray-100 border border-black"
                          : "bg-gray-50 opacity-75 border border-gray-300"
                      }`}
                      onClick={() => handleMemberClick(member)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || "/placeholder.svg"}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className={`font-semibold ${canAccessGroup(member) ? "text-black" : "text-gray-500"}`}
                              >
                                {member.name}
                              </h3>
                              {member.isLocked ? (
                                <Lock className="w-4 h-4 text-black" />
                              ) : (
                                <Unlock className="w-4 h-4 text-black" />
                              )}
                            </div>
                            <p className={`text-sm ${canAccessGroup(member) ? "text-gray-600" : "text-gray-400"}`}>
                              {member.eventsCount} events • {member.members.length} members
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {isGroupMember(member) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-1 h-8 w-8"
                                onClick={(e) => handleToggleLock(member.id, e)}
                              >
                                {member.isLocked ? (
                                  <Lock className="w-4 h-4 text-black" />
                                ) : (
                                  <Unlock className="w-4 h-4 text-black" />
                                )}
                              </Button>
                            )}
                            <ChevronRight
                              className={`w-5 h-5 ${canAccessGroup(member) ? "text-black" : "text-gray-300"}`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Create Group Dialog */}
                <Dialog open={showCreateGroupDialog} onOpenChange={setShowCreateGroupDialog}>
                  <DialogContent className="bg-white">
                    {/* Create Group Dialog */}
                    <DialogHeader>
                      <DialogTitle>Шинэ бүлэг үүсгэх</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="groupName">Бүлгийн нэр</Label>
                        <Input
                          id="groupName"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="Бүлгийн нэр оруулах"
                        />
                      </div>
                      <div>
                        <Label htmlFor="groupAvatar">Бүлгийн зураг</Label>
                        <Input
                          id="groupAvatar"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="cursor-pointer"
                        />
                        {newGroupAvatar && (
                          <div className="mt-2">
                            <img
                              src={newGroupAvatar || "/placeholder.svg"}
                              alt="Preview"
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateGroup} className="flex-1">
                          Бүлэг үүсгэх
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateGroupDialog(false)
                            setNewGroupName("")
                            setNewGroupAvatar("")
                          }}
                          className="flex-1"
                        >
                          Цуцлах
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Group Dialog */}
                <Dialog open={showDeleteGroupDialog} onOpenChange={setShowDeleteGroupDialog}>
                  <DialogContent className="bg-white">
                    {/* Delete Group Dialog */}
                    <DialogHeader>
                      <DialogTitle>Бүлэг устгах</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Устгах бүлгээ сонгоно уу:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {familyMembers.map((member) => (
                          <Card
                            key={member.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleDeleteGroup(member.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={member.avatar || "/placeholder.svg"}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    {member.eventsCount} events • {member.members.length} members
                                  </p>
                                </div>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button variant="outline" onClick={() => setShowDeleteGroupDialog(false)} className="w-full">
                        Цуцлах
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Passcode Dialog for locked groups */}
                <Dialog open={showPasscodeDialog} onOpenChange={setShowPasscodeDialog}>
                  <DialogContent className="bg-white">
                    {/* Passcode Dialog for locked groups */}
                    <DialogHeader>
                      <DialogTitle>Нууц код оруулах</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Энэ бүлэг түгжээтэй байна. Нэвтрэхийн тулд нууц кодоо оруулна уу.
                      </p>
                      <div>
                        <Label htmlFor="passcode">Нууц код</Label>
                        <Input
                          id="passcode"
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder="Нууц код оруулах"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handlePasscodeSubmit} className="flex-1">
                          Илгээх
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasscodeDialog(false)
                            setPasscode("")
                            setSelectedLockedGroup(null)
                          }}
                          className="flex-1"
                        >
                          Цуцлах
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {currentView === "events" && selectedMember && (
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={handleBackFromEvents} className="p-1 h-8 w-8">
                      <ArrowLeft className="w-6 h-6 text-black" />
                    </Button>
                    <h1 className="text-xl font-semibold text-black bg-white px-3 py-1 rounded-lg border border-black shadow-lg">
                      Цомогууд
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="w-6 h-6 text-black" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <MoreHorizontal className="w-6 h-6 text-black" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-black">
                        <DropdownMenuItem onClick={() => setShowCreateEventDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Цомог нэмэх
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDeleteEventDialog(true)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-sm text-gray-600 mb-4">{selectedMember.name}'s Events</p>

                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-gray-200">
                  <button
                    className={`pb-2 text-sm font-medium ${
                      activeEventsTab === "all"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveEventsTab("all")}
                  >
                    Бүгд
                  </button>
                  <button
                    className={`pb-2 text-sm font-medium ${
                      activeEventsTab === "created"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveEventsTab("created")}
                  >
                    Миний үүсгэсэн
                  </button>
                  <button
                    className={`pb-2 text-sm font-medium ${
                      activeEventsTab === "members"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveEventsTab("members")}
                  >
                    Гишүүд
                  </button>
                </div>

                {/* Content based on active tab */}
                {activeEventsTab === "members" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-black">Арга хэмжээний гишүүд</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setShowAddMemberDialog(true)}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Нэмэх
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowRemoveMemberDialog(true)}
                          className="border-black text-black hover:bg-gray-100"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Устгах
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {getEventMembers().map((member) => (
                        <Card key={member.id} className="border border-black">
                          <CardContent className="p-3">
                            <div className="flex flex-col items-center text-center">
                              <img
                                src={member.avatar || "/placeholder.svg"}
                                alt={member.name}
                                className="w-12 h-12 rounded-full object-cover mb-2"
                              />
                              <h4 className="font-medium text-black text-sm">{member.name}</h4>
                              {selectedEvent?.createdBy === member.id && (
                                <span className="text-xs text-gray-500 mt-1">Үүсгэгч</span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getFilteredEvents().map((event) => (
                      <Card
                        key={event.id}
                        className="cursor-pointer hover:bg-gray-50 transition-colors border border-black"
                        onClick={() => handleEventClick(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.image || "/placeholder.svg"}
                              alt={event.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-black">{event.title}</h3>
                              <p className="text-sm text-gray-600">{event.date}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{getPhotoCount(event.id)} photos</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Create Event Dialog */}
                <Dialog open={showCreateEventDialog} onOpenChange={setShowCreateEventDialog}>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Шинэ арга хэмжээ үүсгэх</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="eventTitle">Арга хэмжээний нэр</Label>
                        <Input
                          id="eventTitle"
                          value={newEventTitle}
                          onChange={(e) => setNewEventTitle(e.target.value)}
                          placeholder="Арга хэмжээний нэр оруулах"
                        />
                      </div>
                      <div>
                        <Label htmlFor="eventDate">Огноо</Label>
                        <Input
                          id="eventDate"
                          type="date"
                          value={newEventDate}
                          onChange={(e) => setNewEventDate(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateEvent} className="flex-1">
                          Үүсгэх
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowCreateEventDialog(false)
                            setNewEventTitle("")
                            setNewEventDate("")
                          }}
                          className="flex-1"
                        >
                          Цуцлах
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Event Dialog */}
                <Dialog open={showDeleteEventDialog} onOpenChange={setShowDeleteEventDialog}>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Арга хэмжээ устгах</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Устгах арга хэмжээгээ сонгоно уу:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {events.map((event) => (
                          <Card
                            key={event.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={event.image || "/placeholder.svg"}
                                  alt={event.title}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                                  <p className="text-sm text-gray-600">{event.date}</p>
                                </div>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button variant="outline" onClick={() => setShowDeleteEventDialog(false)} className="w-full">
                        Цуцлах
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Add Member Dialog */}
                <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Гишүүн нэмэх</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="memberName">Гишүүний нэр</Label>
                        <Input
                          id="memberName"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="Гишүүний нэр оруулах"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddMember} className="flex-1">
                          Нэмэх
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddMemberDialog(false)
                            setNewMemberName("")
                          }}
                          className="flex-1"
                        >
                          Цуцлах
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Remove Member Dialog */}
                <Dialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Гишүүн хасах</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Хасах гишүүнээ сонгоно уу:</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {getEventMembers().map((member) => (
                          <Card
                            key={member.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={member.avatar || "/placeholder.svg"}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                                  {selectedEvent?.createdBy === member.id && (
                                    <span className="text-xs text-gray-500">Үүсгэгч</span>
                                  )}
                                </div>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <Button variant="outline" onClick={() => setShowRemoveMemberDialog(false)} className="w-full">
                        Цуцлах
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {currentView === "album" && selectedEvent && (
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pt-2">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={handleBackFromAlbum} className="p-1 h-8 w-8">
                      <ArrowLeft className="w-6 h-6 text-black" />
                    </Button>
                    <h1 className="text-xl font-semibold text-black bg-white px-3 py-1 rounded-lg border border-black shadow-lg">
                      Цомог
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="w-6 h-6 text-black" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                          <MoreHorizontal className="w-6 h-6 text-black" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-black">
                        <DropdownMenuItem onClick={() => setShowAddPhotoDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Зураг нэмэх
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDeletePhotoDialog(true)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Устгах
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Event Title */}
                <h2 className="text-lg font-semibold text-black mb-4">{selectedEvent.title}</h2>

                {/* Tabs */}
                <div className="flex gap-6 mb-6 border-b border-gray-200">
                  <button
                    className={`pb-2 text-sm font-medium ${
                      activeAlbumTab === "all"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveAlbumTab("all")}
                  >
                    Бүх зураг
                  </button>
                  <button
                    className={`pb-2 text-sm font-medium ${
                      activeAlbumTab === "added"
                        ? "text-black border-b-2 border-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveAlbumTab("added")}
                  >
                    Миний нэмсэн
                  </button>
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {getFilteredPhotos().map((photo) => (
                    <div key={photo.id} className="aspect-square">
                      <img
                        src={photo.url || "/placeholder.svg"}
                        alt="Event photo"
                        className="w-full h-full object-cover rounded-lg border border-black cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handlePhotoClick(photo)}
                      />
                    </div>
                  ))}
                </div>

                {getFilteredPhotos().length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Зураг байхгүй байна</p>
                  </div>
                )}

                {/* Add Photo Dialog */}
                <Dialog open={showAddPhotoDialog} onOpenChange={setShowAddPhotoDialog}>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Зураг нэмэх</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="photoFile">Зураг сонгох</Label>
                        <Input
                          id="photoFile"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="cursor-pointer"
                        />
                        {newPhotoFile && (
                          <div className="mt-2">
                            <img
                              src={newPhotoFile || "/placeholder.svg"}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddPhoto} className="flex-1">
                          Нэмэх
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowAddPhotoDialog(false)
                            setNewPhotoFile("")
                          }}
                          className="flex-1"
                        >
                          Цуцлах
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Photo Dialog */}
                <Dialog open={showDeletePhotoDialog} onOpenChange={setShowDeletePhotoDialog}>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Зураг устгах</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">Устгах зургаа сонгоно уу:</p>
                      <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                        {eventPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="relative cursor-pointer group"
                            onClick={() => {
                              // Handle photo deletion
                              const photoRef = ref(database, `photos/${photo.id}`)
                              remove(photoRef)
                              setShowDeletePhotoDialog(false)
                            }}
                          >
                            <img
                              src={photo.url || "/placeholder.svg"}
                              alt="Photo"
                              className="w-full aspect-square object-cover rounded-lg border border-black"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Trash2 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" onClick={() => setShowDeletePhotoDialog(false)} className="w-full">
                        Цуцлах
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Photo Modal */}
            <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
              <DialogContent className="bg-white max-w-4xl w-full h-[90vh] p-0">
                <div className="relative w-full h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Зураг харах</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectedPhoto && handleDownloadPhoto(selectedPhoto)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Татах
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setShowPhotoModal(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Photo Display */}
                  <div className="flex-1 flex items-center justify-center p-4 bg-black">
                    {selectedPhoto && (
                      <img
                        src={selectedPhoto.url || "/placeholder.svg"}
                        alt="Enlarged photo"
                        className="max-w-full max-h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}
