# Week 4 Setup Guide - AI Integration

## 🚀 Quick Start

Week 4 introduces AI-powered trip planning. Follow these steps to get it working:

---

## 1. Database Setup

### Step 1: Open Supabase SQL Editor
1. Go to https://app.supabase.com/
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Run Migration Script
1. Copy the contents of `docs/travel-plans-setup.sql`
2. Paste into the SQL Editor
3. Click "Run" or press `Ctrl+Enter`
4. Wait for success message

### Step 3: Verify Tables
```sql
-- Run this query to verify tables were created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('travel_plans', 'itinerary_details');
```

You should see both tables listed.

---

## 2. API Key Configuration

### Get Alibaba Cloud Bailian API Key

1. **Sign up** for Alibaba Cloud: https://www.aliyun.com/
2. **Navigate** to Bailian Platform: https://bailian.console.aliyun.com/
3. **Create** an API key:
   - Go to "API管理" → "API密钥"
   - Click "创建API密钥"
   - Copy the generated key

### Add to Environment Variables

Edit `frontend/.env`:

```bash
# Alibaba Cloud Bailian Platform (阿里云百炼平台)
VITE_LLM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

**Important**: 
- Never commit `.env` to git
- Keep your API key secret
- `.env` is already in `.gitignore`

---

## 3. Testing the Features

### Test 1: Create a Plan with AI

1. **Start dev server**:
   ```powershell
   cd frontend
   npm run dev
   ```

2. **Login** to your account

3. **Navigate** to "创建计划" or `/planner`

4. **Fill in the form**:
   - Destination: 北京
   - Date Range: Any future dates (e.g., 5 days)
   - Budget: 5000
   - Travelers: 2
   - Description (optional): 喜欢历史文化和美食

5. **Click "生成旅行计划"**

6. **Wait** for AI generation (10-30 seconds)
   - You should see a loading message
   - Progress indicator appears

7. **Success**: You'll be redirected to the plan detail page

### Test 2: View Plan Details

1. After generation, you should see:
   - Plan title and description
   - Destination, dates, budget summary
   - Day-by-day itinerary
   - Activities with timeline
   - Accommodation, transportation, meals for each day
   - Cost breakdown

2. Verify data is displayed correctly

### Test 3: My Plans List

1. **Navigate** to "我的计划" or `/plans`

2. You should see:
   - Your newly created plan in a card
   - Status tag (草稿)
   - Destination and dates
   - Budget and travelers

3. **Click "查看"** to view details again

### Test 4: Delete a Plan

1. On the plans list, click "删除"
2. Confirm in the modal
3. Plan should disappear from the list

---

## 4. Troubleshooting

### Error: "请先配置阿里云百炼API密钥"

**Solution**: 
- Check that `.env` file exists in `frontend/` folder
- Verify `VITE_LLM_API_KEY` is set
- Restart dev server after adding env variables

### Error: "AI生成失败" or "API调用失败"

**Possible causes**:
1. Invalid API key
2. No credits in Alibaba Cloud account
3. Network connection issues
4. API rate limit exceeded

**Solutions**:
- Check API key is correct
- Verify account has credits: https://bailian.console.aliyun.com/
- Check browser console for detailed error
- Wait a few minutes and try again

### Error: "保存计划失败"

**Possible causes**:
1. Database tables not created
2. RLS policies blocking access
3. User not authenticated

**Solutions**:
- Re-run `travel-plans-setup.sql`
- Verify you're logged in
- Check Supabase dashboard for table existence
- Check browser console for Supabase errors

### AI Returns Malformed Response

**Symptoms**: "无法解析AI返回的旅行计划"

**Solution**:
- This can happen occasionally with AI
- Click "重新生成" (if implemented) or try again
- Try simplifying your description
- Check that budget and dates are reasonable

---

## 5. What's Working Now

✅ **Functional Features**:
- User authentication (login/register)
- Voice input UI (mock data)
- Manual plan input form
- AI trip generation with Alibaba Cloud
- Plan save to database
- Plan list with filtering
- Plan detail view with beautiful timeline
- Plan deletion with confirmation

⏳ **Coming in Week 5**:
- Map integration (高德地图)
- Visual route display
- Interactive markers
- Plan editing
- Voice input actual API integration

---

## 6. Example AI Prompt Result

When you input:
- Destination: 北京
- Dates: 2025-11-01 to 2025-11-05 (5 days)
- Budget: ¥5000
- Travelers: 2

The AI will generate:
- 5 days of detailed itinerary
- 3-5 activities per day with times
- Accommodation recommendations
- Transportation suggestions
- Meal recommendations for breakfast/lunch/dinner
- Cost breakdown for each activity
- Tips and reminders

---

## 7. API Usage Tips

### Free Tier Limits (Alibaba Cloud)
- Check current limits: https://help.aliyun.com/document_detail/2712195.html
- Monitor usage in console
- Set up billing alerts

### Cost Optimization
- Each plan generation costs ~0.01-0.05 RMB
- Use temperature=0.7 for balanced results
- Max tokens=4000 is sufficient for 7-day trips
- Cache common destinations (future feature)

---

## 8. Next Steps

After confirming everything works:

1. **Week 5 Prep**:
   - Get 高德地图 API key: https://console.amap.com/
   - Add to `.env`: `VITE_AMAP_KEY=your_key_here`

2. **Create Test Plans**:
   - Try different destinations
   - Various budgets and durations
   - Different traveler counts

3. **Provide Feedback**:
   - Note any AI generation issues
   - UI/UX improvements needed
   - Missing features

---

## 🎉 Success Criteria

You've successfully set up Week 4 if:

- ✅ Database tables created in Supabase
- ✅ Can generate AI plans with real data
- ✅ Plans save and load correctly
- ✅ Detail page displays beautiful itinerary
- ✅ Can delete plans
- ✅ No console errors

**Congratulations!** You now have a working AI travel planner. Ready for Week 5: Map Integration! 🗺️

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Verify all environment variables are set
3. Ensure Supabase and Alibaba Cloud credentials are valid
4. Review `docs/Week4-Summary.md` for technical details

Happy planning! ✈️
