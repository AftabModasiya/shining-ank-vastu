import 'dart:convert';
import 'package:flutter/material.dart';

/// Central data configuration. Can be fetched dynamically from assets or Firestore.
const String gridConfigJson = '''
[
  {
    "id": "mobile_analysis",
    "title": "Mobile Number Analysis",
    "tag": "📱 PHONE VIBES",
    "gradient": ["#B5820A", "#D4A326"],
    "subtext": "10-Digit Frequency • Wealth Calculator",
    "icon": "phone"
  },
  {
    "id": "marriage_prediction",
    "title": "Love vs Arranged Marriage Prediction",
    "tag": "💖 RELATIONSHIP",
    "gradient": ["#8C6F58", "#B5820A"],
    "subtext": "Lo Shu Affinity • Life Partner Vibe",
    "icon": "heart"
  },
  {
    "id": "match_making",
    "title": "Match Making Compatibility",
    "tag": "🤝 36 GUNAS",
    "gradient": ["#B5820A", "#9A6E08"],
    "subtext": "Couple Score • Conflict Analysis",
    "icon": "users"
  },
  {
    "id": "stock_suitability",
    "title": "Stock Market Suitability",
    "tag": "📈 WEALTH PLANES",
    "gradient": ["#8C6F58", "#9A6E08"],
    "subtext": "Intraday vs Long-Term • Lucky Sectors",
    "icon": "trending-up"
  },
  {
    "id": "logo_analysis",
    "title": "Logo Analysis",
    "tag": "🏢 BUSINESS VIBES",
    "gradient": ["#B5820A", "#8C6F58"],
    "subtext": "Brand Power • Color Compatibility",
    "icon": "briefcase"
  },
  {
    "id": "foreign_settlement",
    "title": "Foreign Settlement Prediction",
    "tag": "✈️ GLOBE TRAVELLER",
    "gradient": ["#8C6F58", "#D4A326"],
    "subtext": "Visa PR Chances • Lucky Directions",
    "icon": "plane"
  },
  {
    "id": "baby_birth_calc",
    "title": "Baby Birth Date Calculator",
    "tag": "👶 PERFECT DATES",
    "gradient": ["#B5820A", "#8C6F58"],
    "subtext": "Expected Delivery Range • Gender Fit",
    "icon": "baby"
  },
  {
    "id": "baby_name_suggest",
    "title": "Baby Name Spelling Suggestion",
    "tag": "💯 CHALDEAN VIBE",
    "gradient": ["#B5820A", "#D4A326"],
    "subtext": "Missing Core Balance • 15+ Names",
    "icon": "award"
  }
]
''';

class PremiumAnalysisDashboard extends StatelessWidget {
  final String clientId;
  final Function(Map<String, dynamic> config) onCardTap;

  const PremiumAnalysisDashboard({
    Key? key,
    required this.clientId,
    required this.onCardTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final List<dynamic> configList = jsonDecode(gridConfigJson);
    
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF7E8D6), Color(0xFFEAD0B8)],
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "✨ Premium Vedic Analysis",
            style: TextStyle(
              fontFamily: 'Playfair Display',
              color: Color(0xFF3D2C1E),
              fontSize: 24.0,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 6.0),
          const Text(
            "Tap any analysis card to open the Global Analysis Screen with real-time predictions.",
            style: TextStyle(
              color: Color(0xFF5A4230),
              fontSize: 13.5,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 24.0),
          Expanded(
            child: GridView.builder(
              physics: const BouncingScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16.0,
                mainAxisSpacing: 16.0,
                childAspectRatio: 0.88, // Uniform box sizing ratio
              ),
              itemCount: configList.length,
              itemBuilder: (context, index) {
                final item = configList[index] as Map<String, dynamic>;
                return AnalysisGridCard(
                  config: item,
                  onTap: () => onCardTap(item),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class AnalysisGridCard extends StatelessWidget {
  final Map<String, dynamic> config;
  final VoidCallback onTap;

  const AnalysisGridCard({
    Key? key,
    required this.config,
    required this.onTap,
  }) : super(key: key);

  IconData _getIconData(String iconName) {
    switch (iconName) {
      case 'phone':
        return Icons.phone_android_rounded;
      case 'heart':
        return Icons.favorite_rounded;
      case 'users':
        return Icons.people_alt_rounded;
      case 'trending-up':
        return Icons.trending_up_rounded;
      case 'briefcase':
        return Icons.business_center_rounded;
      case 'plane':
        return Icons.airplanemode_active_rounded;
      case 'baby':
        return Icons.child_care_rounded;
      case 'award':
      default:
        return Icons.military_tech_rounded;
    }
  }

  Color _hexToColor(String hexStr) {
    final String cleanHex = hexStr.replaceAll('#', '');
    return Color(int.parse('FF$cleanHex', radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final List<dynamic> gradientHexes = config['gradient'];
    final Color colorStart = _hexToColor(gradientHexes[0]);
    final Color colorEnd = _hexToColor(gradientHexes[1]);

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24.0), // Uniform 24px border radius
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [colorStart, colorEnd],
        ),
        boxShadow: [
          BoxShadow(
            color: colorStart.withOpacity(0.25),
            blurRadius: 12.0,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24.0),
        child: Stack(
          children: [
            Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: onTap,
                splashColor: Colors.white.withOpacity(0.15),
                highlightColor: Colors.white.withOpacity(0.05),
                child: Padding(
                  padding: const EdgeInsets.all(18.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Top Left: Pill chip tag
                      Align(
                        alignment: Alignment.topLeft,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 5.0),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(100.0),
                          ),
                          child: Text(
                            (config['tag'] as String).toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9.0,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ),

                      // Center Left: Neon glow Icon
                      Icon(
                        _getIconData(config['icon']),
                        color: Colors.white,
                        size: 28.0,
                        shadows: [
                          Shadow(
                            color: Colors.white.withOpacity(0.6),
                            blurRadius: 8.0,
                          ),
                        ],
                      ),

                      // Bottom: Title & Subtext
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            config['title'],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14.5,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4.0),
                          Text(
                            (config['subtext'] as String).split('•').first.trim(),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 10.0,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Global Analysis Screen Widget showing client info, Lo Shu grid and custom observations.
class GlobalAnalysisScreenWidget extends StatefulWidget {
  final String topicId;
  final Map<String, dynamic> config;
  final Map<String, dynamic> clientData;

  const GlobalAnalysisScreenWidget({
    Key? key,
    required this.topicId,
    required this.config,
    required this.clientData,
  }) : super(key: key);

  @override
  State<GlobalAnalysisScreenWidget> createState() => _GlobalAnalysisScreenWidgetState();
}

class _GlobalAnalysisScreenWidgetState extends State<GlobalAnalysisScreenWidget> {
  late List<String> customObservations;
  final TextEditingController _inputController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final Map<String, dynamic> report = widget.clientData['report'] ?? {};
    final Map<String, dynamic> customLines = report['customLines'] ?? {};
    customObservations = List<String>.from(customLines[widget.topicId] ?? []);
  }

  @override
  Widget build(BuildContext context) {
    final gradientHexes = widget.config['gradient'];
    final Color colorStart = Color(int.parse('FF${gradientHexes[0].replaceAll('#', '')}', radix: 16));
    final Color colorEnd = Color(int.parse('FF${gradientHexes[1].replaceAll('#', '')}', radix: 16));

    final String name = widget.clientData['name'] ?? '';
    final String dob = widget.clientData['dob'] ?? '';
    final String phone = widget.clientData['phone'] ?? 'N/A';

    return Scaffold(
      backgroundColor: const Color(0xFFF7E8D6),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFF7E8D6), Color(0xFFEAD0B8)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Color(0xFF3D2C1E)),
                        onPressed: () => Navigator.pop(context),
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFB5820A),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10.0),
                          ),
                        ),
                        onPressed: () {
                          // Trigger PDF Export in Flutter
                        },
                        icon: const Icon(Icons.download_rounded, size: 16.0),
                        label: const Text("Export PDF", style: TextStyle(fontSize: 12.0)),
                      ),
                    ],
                  ),
                ),

                // Hero Banner
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16.0),
                  padding: const EdgeInsets.all(20.0),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20.0),
                    gradient: LinearGradient(
                      colors: [colorStart, colorEnd],
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.config['tag'],
                        style: const TextStyle(color: Colors.white70, fontSize: 9.5, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 6.0),
                      Text(
                        widget.config['title'],
                        style: const TextStyle(color: Colors.white, fontSize: 18.5, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16.0),

                // COMMON INFO SUMMARY CARD
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16.0),
                  padding: const EdgeInsets.all(18.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFEEF).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20.0),
                    border: Border.all(color: const Color(0xFFEAD0B8)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "👤 Client Details Summary",
                        style: TextStyle(color: Color(0xFF3D2C1E), fontSize: 15.0, fontWeight: FontWeight.bold),
                      ),
                      const Divider(color: Color(0xFFEAD0B8), height: 20.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("Name:", style: TextStyle(color: Color(0xFF8C6F58))),
                          Text(name, style: const TextStyle(color: Color(0xFF3D2C1E), fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("DOB:", style: TextStyle(color: Color(0xFF8C6F58))),
                          Text(dob, style: const TextStyle(color: Color(0xFF3D2C1E), fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: 8.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("Mobile Number:", style: TextStyle(color: Color(0xFF8C6F58))),
                          Text(phone, style: const TextStyle(color: Color(0xFF3D2C1E), fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16.0),

                // LO SHU GRID ANALYSIS CARD
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16.0),
                  padding: const EdgeInsets.all(18.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFEEF).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20.0),
                    border: Border.all(color: const Color(0xFFEAD0B8)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "☯️ Lo Shu Grid Analysis",
                        style: TextStyle(color: Color(0xFF3D2C1E), fontSize: 15.0, fontWeight: FontWeight.bold),
                      ),
                      const Divider(color: Color(0xFFEAD0B8), height: 20.0),
                      
                      // 3x3 Lo Shu Grid Layout
                      Center(
                        child: Container(
                          width: 150,
                          height: 150,
                          padding: const EdgeInsets.all(4.0),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEAD0B8).withOpacity(0.5),
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                          child: GridView.count(
                            crossAxisCount: 3,
                            crossAxisSpacing: 4.0,
                            mainAxisSpacing: 4.0,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            children: [4, 9, 2, 3, 5, 7, 8, 1, 6].map((num) {
                              return Container(
                                decoration: BoxDecoration(
                                  color: Colors.amber.shade50,
                                  borderRadius: BorderRadius.circular(6.0),
                                  border: Border.all(color: const Color(0xFFB5820A).withOpacity(0.4)),
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  "$num",
                                  style: const TextStyle(
                                    color: Color(0xFFB5820A),
                                    fontSize: 16.0,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12.0),
                      const Text(
                        "Planets & Core Planes summary is processed dynamically according to standard Chaldean-Vedic numerological metrics.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Color(0xFF5A4230), fontSize: 11.5),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16.0),

                // ADMINISTRATIVE OBSERVATIONS CARD
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16.0),
                  padding: const EdgeInsets.all(18.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFEEF).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20.0),
                    border: Border.all(color: const Color(0xFFEAD0B8)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        "📋 Dynamic Admin Observations",
                        style: TextStyle(color: Color(0xFF3D2C1E), fontSize: 15.0, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12.0),
                      
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: customObservations.length,
                        itemBuilder: (context, idx) {
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8.0),
                            padding: const EdgeInsets.all(10.0),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(8.0),
                              border: Border.all(color: const Color(0xFFEAD0B8).withOpacity(0.5)),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  "${idx + 1}.",
                                  style: const TextStyle(color: Color(0xFFB5820A), fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(width: 8.0),
                                Expanded(
                                  child: Text(
                                    customObservations[idx],
                                    style: const TextStyle(color: Color(0xFF3D2C1E), fontSize: 12.5),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 10.0),

                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _inputController,
                              style: const TextStyle(color: Color(0xFF3D2C1E), fontSize: 12.5),
                              decoration: InputDecoration(
                                hintText: "Add observation line...",
                                hintStyle: const TextStyle(color: Colors.black26),
                                filled: true,
                                fillColor: Colors.white,
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12.0),
                                  borderSide: const BorderSide(color: Color(0xFFEAD0B8)),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8.0),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFB5820A),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12.0),
                              ),
                            ),
                            onPressed: () {
                              if (_inputController.text.trim().isNotEmpty) {
                                setState(() {
                                  customObservations.add(_inputController.text.trim());
                                  _inputController.clear();
                                });
                              }
                            },
                            child: const Icon(Icons.add, color: Colors.white),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20.0),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
