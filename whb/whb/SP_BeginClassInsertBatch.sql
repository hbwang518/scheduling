USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_BeginClassInsertBatch]    Script Date: 2015/1/6 16:51:44 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--添加自动排课数据    
CREATE proc [dbo].[SP_BeginClassInsertBatch]    
@DateArrayStr varchar(2000), 
@CourseTimeArrayStr varchar(200),
@Course NVarChar(20) ='',    
@TeacherSN varchar(20)='',
@ClassRoomSN varchar(20)='',
@FactClassSN varchar(20)='',
@DeductionCTime Decimal(18,2),
@SettlementState varchar(50),
@TeacherGoldSN varchar(20)='',
@SolveConflict int,
@UserSN varchar(20),
@OutputValue nvarchar(2000) output
as    
begin  
    set @OutputValue = ''  
	declare @totalTime float, @CurrentDurationTime float, @BeginClassSN nvarchar(20), @TimeStr nvarchar(50), @TimeIndex int, @StartTimeInt int, @EndTimeInt int, @Day date, @Start int,@End int, @TimeStart int,@TimeEnd int
	     
	 --物理班是否存在  
	if '' != @factClassSN 
	begin
	   if not exists(select 1 from FactClass where FactClassSN=@FactClassSN and DEL=0)    
		  return 1  --exception
	end
	 
	if '' != @TeacherSN 
	begin
		 if not exists(select 1 from Teacher where TeacherSN=@TeacherSN and DEL=0)    
			return 1 --exception
		 If Not Exists(Select 1 From TeacherCourseGold Where TCGoldSN = @TeacherGoldSN And TeacherSN = @TeacherSN) 
			return 2 --课标不存在 
	end

	if '' != @ClassRoomSN 
	begin
		 if not exists(select 1 from ClassRoom where ClassRoomSN=@ClassRoomSN and DEL=0)    
			return 1  --exception
	end
	
	--validate duration time
	select @totalTime=FCTime  from FactClass where FactClassSN = @FactClassSN
	select @CurrentDurationTime = sum(DeductionCTime) from BeginClass where FactClassSN = @FactClassSN and DEL=0 and State<>-1
	--循环累加duration time
	set @Start = 1
	set @End = charindex(',', @DateArrayStr, @start)
	
	while(@End>-1)
	begin
	    set @TimeStart = 1
		set @TimeEnd = charindex(',', @CourseTimeArrayStr, @TimeStart)
		while(@TimeEnd>-1)
		begin
		    -- validate
		    set @CurrentDurationTime = @CurrentDurationTime + @DeductionCTime
		    if @CurrentDurationTime > @totalTime
		        return 3
			-- check loop
			if (@TimeEnd = 0) break			
			set @TimeStart = @TimeEnd+1
			set @TimeEnd = charindex(',', @CourseTimeArrayStr, @TimeStart)	
		end
		if(@End=0) break
		set @Start = @End+1
		set @End = charindex(',', @DateArrayStr, @Start)		
	end 
	
	--循环增加每天每个时段的BeginClass
	set @Start = 1
	set @End = charindex(',', @DateArrayStr, @start)
	
	while(@End>-1)
	begin
	    if @End = 0
			set @Day=convert(datetime,substring(@DateArrayStr,@Start,len(@DateArrayStr)-@start+1))
	    else
			set @Day=convert(datetime,substring(@DateArrayStr,@Start,@End-@Start))
		set @TimeStart = 1
		set @TimeEnd = charindex(',', @CourseTimeArrayStr, @TimeStart)
		while(@TimeEnd>-1)
		begin
		    if @TimeEnd = 0
				set @TimeStr=substring(@CourseTimeArrayStr,@TimeStart,len(@CourseTimeArrayStr)-@TimeStart+1)
		    else
				set @TimeStr=substring(@CourseTimeArrayStr,@TimeStart,@TimeEnd-@TimeStart)
			
			set @TimeIndex = charindex(';', @TimeStr)
			set @StartTimeInt = substring(@TimeStr, 1, @TimeIndex-1)
			set @EndTimeInt = substring(@TimeStr, @TimeIndex+1, len(@TimeStr) - @TimeIndex)
			-- validate
			if '' != @FactClassSN
			begin
				if exists(select 1 from BeginClass where FactClassSN=@FactClassSN and datediff(day,[Day],@Day)=0 And Del=0 and State<>-1 and ((@StartTimeInt <= StartTime And @EndTimeInt > StartTime) Or (@StartTimeInt >= StartTime And @StartTimeInt < EndTime)))
				begin
				    if 1 = @SolveConflict 
						continue
				    else
						return 5 --物理班时间相重 
				end
			end
			if '' != @TeacherSN
			begin
				if exists(select 1 from BeginClass a inner join Teacher b on a.TeacherSN=b.TeacherSN where a.TeacherSN=@TeacherSN and datediff(day,[Day],@Day)=0 And a.Del=0  and a.State<>-1 and b.del=0 and ((@StartTimeInt <= StartTime And @EndTimeInt > StartTime) Or (@StartTimeInt >= StartTime And @StartTimeInt < EndTime)))
				begin
				    if 1 = @SolveConflict 
						continue
				    else
						return 6	--教师时间安排相重
				end					
			end
			if '' != @ClassRoomSN
			begin
				if exists(select 1 from BeginClass a inner join ClassRoom b on a.ClassRoomSN=b.ClassRoomSN where a.ClassROOMSN=@ClassroomSN and datediff(day,[Day],@Day)=0 And a.Del=0  and a.State<>-1 and b.del=0 and ((@StartTimeInt <= StartTime And @EndTimeInt > StartTime) Or (@StartTimeInt >= StartTime And @StartTimeInt < EndTime)))
				begin
				    if 1 = @SolveConflict 
						continue
				    else
						return 8	--教室时间安排相重
				end
			end
			--insert begin class
			EXEC [SP_ReturnSN] 'BCS',@beginClassSN out
			set @OutputValue = @OutputValue + ',' + @beginClassSN
			print @OutputValue
			
			Insert Into BeginClass    
				 (BeginClassSN,FactClassSN,ClassRoomSN,[Day],StartTime,EndTime,Course,TeacherSN,TCGoldSN,DeductionCTime,SettlementState,CreateUserSN)    
			Values     
				 (@BeginClassSN,@FactClassSN,@ClassRoomSN,@Day,@StartTimeInt,@EndTimeInt,@Course,@TeacherSN,@TeacherGoldSN,@DeductionCTime,@settlementState,@UserSN)    
	 
			insert into BeginClassState(BeginClassSN,SettlementState,CreateTime,CreateUserSN) values(@BeginClassSN,@settlementState,getdate(),@UserSN)
			-- check loop
			if (@TimeEnd = 0) break			
			set @TimeStart = @TimeEnd+1
			set @TimeEnd = charindex(',', @CourseTimeArrayStr, @TimeStart)	
		end
		if(@End=0) break
		set @Start = @End+1
		set @End = charindex(',', @DateArrayStr, @Start)		
	end 
	return 0
end 

GO


