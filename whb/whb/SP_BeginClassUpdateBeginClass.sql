USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_BeginClassUpdateBeginClass]    Script Date: 2015/1/6 16:52:21 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



--添加自动排课数据    
CREATE proc [dbo].[SP_BeginClassUpdateBeginClass]    
@BeginClassSN varchar(20),
@FactClassSN varchar(20)='',
@TeacherSN varchar(20)='',
@ClassRoomSN varchar(20)='',
@StartTime int,
@EndTime int,
@DeductionCTime Decimal(18,2),
@Course NVarChar(20) ='',
@TeacherGoldSN varchar(20)='',
@UserSN varchar(20)
as    
begin  
    declare @totalTime float, @CurrentDurationTime float, @OldFactClassSN nvarchar(20),@OldTeacherSN nvarchar(20), @OldClassRoomSN nvarchar(20), @TimeStr nvarchar(50), @TimeIndex int, @StartTimeInt int, @EndTimeInt int, @Day date, @settlementState nvarchar(50) = 'BSSE001'
	     
	if not exists(select 1 from FactClass where FactClassSN=@FactClassSN and DEL=0)    
		 return 10  --exception	
	
	select @OldFactClassSN=factClassSN, @OldTeacherSN = teacherSN, @OldClassRoomSN=ClassRoomSN, @Day=[Day] from BeginClass where BeginClassSN=@BeginClassSN
	if @OldFactClassSN != @FactClassSN
	begin
	    select @totalTime=FCTime  from FactClass where FactClassSN = @FactClassSN
	    select @CurrentDurationTime = sum(DeductionCTime) from BeginClass where FactClassSN = @FactClassSN and DEL=0 and State<>-1
	    if @CurrentDurationTime + @DeductionCTime > @totalTime
		    return 3 -- course time is 
		--validate factclass time conflict
		if exists(select 1 from BeginClass where FactClassSN=@FactClassSN and datediff(day,[Day],@Day)=0 And Del=0 and State<>-1 and ((@StartTime <= StartTime And @EndTime > StartTime) Or (@StartTime >= StartTime And @StartTime < EndTime)))
		    return 5
	end
	
	if @OldTeacherSN != @TeacherSN
	begin
		if '' != @TeacherSN 
		begin
		    if not exists(select 1 from Teacher where TeacherSN=@TeacherSN and DEL=0)    
			    return 11 --exception
		    If Not Exists(Select 1 From TeacherCourseGold Where TCGoldSN = @TeacherGoldSN And TeacherSN = @TeacherSN) 
			    return 2 --课标不存在 
			if exists(select 1 from BeginClass a inner join Teacher b on a.TeacherSN=b.TeacherSN where a.TeacherSN=@TeacherSN and datediff(day,[Day],@Day)=0 And a.Del=0  and a.State<>-1 and b.del=0 and ((@StartTime <= StartTime And @EndTime > StartTime) Or (@StartTime >= StartTime And @StartTime < EndTime)))
			    return 6	--教师时间安排相重
		end
		else
		begin
		    set @TeacherGoldSN = ''
		    set @Course = ''
		end
	end
	if '' != @ClassRoomSN and @OldClassRoomSN != @ClassRoomSN
    begin
        if not exists(select 1 from ClassRoom where ClassRoomSN=@ClassRoomSN and DEL=0)    
			return 12  --exception
	    if exists(select 1 from BeginClass a inner join ClassRoom b on a.ClassRoomSN=b.ClassRoomSN where a.ClassROOMSN=@ClassroomSN and datediff(day,[Day],@Day)=0 And a.Del=0  and a.State<>-1 and b.del=0 and ((@StartTimeInt <= StartTime And @EndTimeInt > StartTime) Or (@StartTimeInt >= StartTime And @StartTimeInt < EndTime)))
	        return 8	--教室时间安排相重
    end
    
    if '' != @ClassRoomSN and '' != @TeacherSN
		set @settlementState = 'BSSE003'
	else if '' != @ClassRoomSN or '' != @TeacherSN
		set @settlementState = 'BSSE002'
	
	update BeginClass set FactClassSN=@FactClassSN, TeacherSN=@TeacherSN, ClassRoomSN=@ClassRoomSN, Course=@Course,SettlementState=@settlementState,TCGoldSN=@TeacherGoldSN,StartTime=@StartTime, EndTime=@EndTime,DeductionCTime=@DeductionCTime,CreateUserSN=@UserSN where BeginClassSN=@BeginClassSN
	insert into BeginClassState(BeginClassSN,SettlementState,CreateTime,CreateUserSN) values(@BeginClassSN,@settlementState,getdate(),@UserSN)
	
	return 1
end 


GO


