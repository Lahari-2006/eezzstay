/**
 * EzeeStayy - Central Hostel & University Data File
 * 
 * STRUCTURE:
 * city -> university -> hostels[] (name, address, room types, price, contact, photo)
 */

export const universityHostelsData = [
  {
    city: "Hyderabad",
    university: "KL University, Hyderabad",
    hostels: [
      {
        id: "klu-hyd-01",
        name: "KL University Hostel (Hyderabad)",
        address: "Aziz Nagar, Moinabad, Hyderabad",
        locality: "Aziz Nagar, Moinabad",
        city: "Hyderabad",
        university: "KL University, Hyderabad",
        room_types: ["2-Sharing AC", "3-Sharing Non-AC"],
        price: "₹1,25,000–1,35,000/yr",
        price_num: 11000,
        contact: "Campus Hostel Office",
        contact_phone: "+91 94401 56789",
        photo: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
        cover_image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
        ],
        gender_type: "Boys & Girls Wings",
        verification_status: "verified",
        trust_score: 96,
        avg_rating: 4.8,
        review_count: 32,
        food_included: true,
        food_type: "South & North Indian Balanced Meals",
        amenities: ["High-speed WiFi", "Attached Washroom", "Food Included", "Daily Housekeeping", "24/7 Campus Security"],
        rules: ["Gate closes at 10:00 PM", "Student ID mandatory for check-in"],
        room_options: [
          {
            room_type: "2-Sharing AC",
            price_monthly: 11250,
            security_deposit: 15000,
            available_beds: 6,
            total_beds: 30,
            attached_bathroom: true,
            ac_available: true
          },
          {
            room_type: "3-Sharing Non-AC",
            price_monthly: 10400,
            security_deposit: 10000,
            available_beds: 8,
            total_beds: 40,
            attached_bathroom: true,
            ac_available: false
          }
        ],
        description: "Official campus student accommodation for KL University Hyderabad. Offers nutritious meal plans, high-speed WiFi, continuous security, and a quiet study atmosphere."
      },
      {
        id: "klu-hyd-02",
        name: "Stanza Living – Sandakan House (Boys)",
        address: "Aziznagar, Hyderabad",
        locality: "Aziznagar",
        city: "Hyderabad",
        university: "KL University, Hyderabad",
        room_types: ["Single AC", "2-Sharing AC"],
        price: "From ₹11,000/mo",
        price_num: 11000,
        contact: "Stanza Living Residence Team",
        contact_phone: "+91 80471 89898",
        photo: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
        cover_image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
        images: [
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
        ],
        gender_type: "Boys",
        verification_status: "verified",
        trust_score: 95,
        avg_rating: 4.7,
        review_count: 28,
        food_included: true,
        food_type: "Chef-Prepared 3 Meals Daily",
        amenities: ["High-speed WiFi", "Attached Washroom", "Food Included", "Biometric Access", "Power Backup", "Game Lounge"],
        rules: ["Gate closes at 10:30 PM", "Biometric verification required"],
        room_options: [
          {
            room_type: "2-Sharing AC",
            price_monthly: 11000,
            security_deposit: 11000,
            available_beds: 4,
            total_beds: 24,
            attached_bathroom: true,
            ac_available: true
          }
        ],
        description: "Modern managed accommodation for male students near KL University Hyderabad with complete furnishings, high-speed internet, and regular cleaning."
      }
    ]
  },
  {
    city: "Vijayawada",
    university: "KL University, Vijayawada",
    hostels: [
      {
        id: "klu-vij-01",
        name: "Aravali Boys Hostel",
        address: "KL University Campus, Vaddeswaram",
        locality: "Vaddeswaram",
        city: "Vijayawada",
        university: "KL University, Vijayawada",
        room_types: ["Non-AC Deluxe", "AC Attached"],
        price: "₹97,975–1,42,975/yr",
        price_num: 8200,
        contact: "+91-8501955111",
        contact_phone: "+91-8501955111",
        photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        cover_image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
        ],
        gender_type: "Boys",
        verification_status: "verified",
        trust_score: 97,
        avg_rating: 4.8,
        review_count: 45,
        food_included: true,
        food_type: "Nutritious Andhra & South Indian Food",
        amenities: ["High-speed WiFi", "Attached Washroom", "Food Included", "Study Desks", "Indoor Sports", "Dispensary"],
        rules: ["Campus timing protocols apply", "Night attendance taken at 9:30 PM"],
        room_options: [
          {
            room_type: "AC Attached",
            price_monthly: 11900,
            security_deposit: 15000,
            available_beds: 5,
            total_beds: 35,
            attached_bathroom: true,
            ac_available: true
          },
          {
            room_type: "Non-AC Deluxe",
            price_monthly: 8200,
            security_deposit: 10000,
            available_beds: 10,
            total_beds: 50,
            attached_bathroom: true,
            ac_available: false
          }
        ],
        description: "Official Aravali on-campus residence for male engineering and science students at KL University Vaddeswaram, featuring spacious rooms and comprehensive facilities."
      },
      {
        id: "klu-vij-02",
        name: "Kanchanaganga Girls Hostel",
        address: "KL University Campus, Vaddeswaram",
        locality: "Vaddeswaram",
        city: "Vijayawada",
        university: "KL University, Vijayawada",
        room_types: ["Non-AC Deluxe", "AC Attached"],
        price: "₹97,975–1,42,975/yr",
        price_num: 8200,
        contact: "08645-350222",
        contact_phone: "08645-350222",
        photo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
        cover_image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
        images: [
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
        ],
        gender_type: "Girls",
        verification_status: "verified",
        trust_score: 98,
        avg_rating: 4.9,
        review_count: 51,
        food_included: true,
        food_type: "Pure Veg & Non-Veg Hygienic Meals",
        amenities: ["High-speed WiFi", "Attached Washroom", "Food Included", "Full-time Warden", "RO Water", "Health Clinic"],
        rules: ["Gate closes at 9:00 PM", "Parent authorization required for leave"],
        room_options: [
          {
            room_type: "AC Attached",
            price_monthly: 11900,
            security_deposit: 15000,
            available_beds: 4,
            total_beds: 30,
            attached_bathroom: true,
            ac_available: true
          },
          {
            room_type: "Non-AC Deluxe",
            price_monthly: 8200,
            security_deposit: 10000,
            available_beds: 8,
            total_beds: 45,
            attached_bathroom: true,
            ac_available: false
          }
        ],
        description: "Official Kanchanaganga on-campus residence for women scholars at KL University Vaddeswaram with 24/7 security, resident wardens, and dedicated reading halls."
      }
    ]
  },
  {
    city: "Pune",
    university: "COEP Technological University, Pune",
    hostels: [
      {
        id: "coep-pune-01",
        name: "COEP Boys' Hostel",
        address: "COEP Tech, Shivajinagar, Pune 411005",
        locality: "Shivajinagar",
        city: "Pune",
        university: "COEP Technological University, Pune",
        room_types: ["2-Sharing", "3-Sharing"],
        price: "₹50,000/yr",
        price_num: 4200,
        contact: "020-25507660",
        contact_phone: "020-25507660",
        photo: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
        cover_image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
        images: [
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800"
        ],
        gender_type: "Boys",
        verification_status: "verified",
        trust_score: 95,
        avg_rating: 4.6,
        review_count: 38,
        food_included: true,
        food_type: "Maharashtrian & North Indian Mess",
        amenities: ["High-speed WiFi", "Attached Washroom", "Food Included", "Library & Study Rooms", "Playground Access"],
        rules: ["Gate closes at 10:00 PM"],
        room_options: [
          {
            room_type: "2-Sharing",
            price_monthly: 4200,
            security_deposit: 5000,
            available_beds: 5,
            total_beds: 30,
            attached_bathroom: false,
            ac_available: false
          }
        ],
        description: "Historic government engineering hostel located right on the COEP Shivajinagar campus with subsidized mess, sports grounds, and academic environment."
      },
      {
        id: "coep-pune-02",
        name: "COEP Girls' Hostel",
        address: "COEP Tech, Shivajinagar, Pune 411005",
        locality: "Shivajinagar",
        city: "Pune",
        university: "COEP Technological University, Pune",
        room_types: ["2-Sharing", "3-Sharing"],
        price: "₹50,000/yr",
        price_num: 4200,
        contact: "020-25507009",
        contact_phone: "020-25507009",
        photo: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
        cover_image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800"
        ],
        gender_type: "Girls",
        verification_status: "verified",
        trust_score: 97,
        avg_rating: 4.8,
        review_count: 42,
        food_included: true,
        food_type: "Hygienic Mess Meals",
        amenities: ["High-speed WiFi", "Food Included", "24/7 Security", "Gymnasium", "Reading Hall"],
        rules: ["Gate closes at 9:30 PM", "Hostel warden clearance mandatory"],
        room_options: [
          {
            room_type: "2-Sharing",
            price_monthly: 4200,
            security_deposit: 5000,
            available_beds: 4,
            total_beds: 25,
            attached_bathroom: false,
            ac_available: false
          }
        ],
        description: "Safe and disciplined campus residence for women engineering scholars at COEP Pune with 24/7 campus security, dining hall, and quiet study rooms."
      }
    ]
  }
];

// Helper Functions
export const getAllHostels = () => {
  const all = [];
  universityHostelsData.forEach((location) => {
    location.hostels.forEach((hostel) => {
      all.push({
        ...hostel,
        city: location.city,
        university: location.university,
      });
    });
  });
  return all;
};

export const getHostelById = (id) => {
  const all = getAllHostels();
  return all.find((h) => String(h.id) === String(id)) || null;
};

export const getLocations = () => {
  return universityHostelsData.map((loc) => ({
    city: loc.city,
    university: loc.university,
    count: `${loc.hostels.length} Verified Hostels`,
  }));
};
